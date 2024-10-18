const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');
const solanaWeb3 = require('@solana/web3.js');
const bs58 = require('bs58').default;
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// 连接到 MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// 用户模型
const User = mongoose.model('User', new mongoose.Schema({
  username: String,
  password: String,
  solWalletPublicKey: String,
  solWalletPrivateKey: String,
  importedWalletId: String
}));

// 生成 Solana 钱包并以 base58 格式编码私钥
function generateSolanaWallet() {
  const keyPair = solanaWeb3.Keypair.generate();
  return {
    publicKey: keyPair.publicKey.toString(),
    privateKey: bs58.encode(keyPair.secretKey)
  };
}

// 导入钱包到 API
async function importWalletToAPI(privateKey) {
  const API_KEY = '6myjdpr69lkzbwayitz6z0sd2jks277w';
  const API_BASE_URL = 'https://api-bot-v1.dbotx.com/account/wallets';

  try {
    const response = await axios.post(API_BASE_URL, {
      type: 'solana',
      privateKeys: [privateKey]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': API_KEY
      }
    });

    if (response.data.err === false && Array.isArray(response.data.res) && response.data.res.length > 0) {
      return response.data.res[0].id;
    } else {
      console.error('API返回错误:', response.data);
      throw new Error(response.data.err || "API返回了意外的响应格式");
    }
  } catch (error) {
    if (error.response) {
      console.error('API请求失败:', error.response.data);
      throw new Error(`API请求失败: ${error.response.status} ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      console.error('未收到API响应:', error.request);
      throw new Error('未收到API响应，请检查网络连接');
    } else {
      console.error('API请求错误:', error.message);
      throw new Error(`API请求错误: ${error.message}`);
    }
  }
}

// 注册路由
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: '用户名已存在' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 生成 Solana 钱包
    const solanaWallet = generateSolanaWallet();
    
    // 导入钱包到 API
    let importedWalletId;
    try {
      importedWalletId = await importWalletToAPI(solanaWallet.privateKey);
    } catch (importError) {
      console.error('钱包导入失败:', importError);
      return res.status(500).json({ message: `钱包导入失败: ${importError.message}` });
    }

    const user = new User({
      username,
      password: hashedPassword,
      solWalletPublicKey: solanaWallet.publicKey,
      solWalletPrivateKey: solanaWallet.privateKey,
      importedWalletId
    });
    
    await user.save();
    
    res.status(201).json({
      message: '注册成功',
      user: {
        id: user._id,
        username: user.username,
        solWalletPublicKey: user.solWalletPublicKey,
        importedWalletId: user.importedWalletId
      }
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ message: '注册失败，请稍后重试' });
  }
});

// 登录路由
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: '用户名或密码错误' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: '用户名或密码错误' });
    }
    res.json({
      message: '登录成功',
      user: {
        id: user._id,
        username: user.username,
        solWalletPublicKey: user.solWalletPublicKey,
        importedWalletId: user.importedWalletId
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ message: '登录失败，请稍后重试' });
  }
});

// 获取钱包信息的路由
app.get('/api/wallet/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    if (!user.importedWalletId) {
      return res.status(404).json({ message: '用户没有关联的钱包' });
    }
    
    res.json({ 
      publicKey: user.solWalletPublicKey,
      importedWalletId: user.importedWalletId
    });
  } catch (error) {
    console.error('获取钱包信息错误:', error);
    res.status(500).json({ message: '获取钱包信息失败，请稍后重试' });
  }
});

// 发送手续费交易的路由
app.post('/api/send-fee', async (req, res) => {
  try {
    const { userId, amount, type } = req.body;
    const FEE_WALLET_ADDRESS = '2YJ1MByeyYvE2tB76Sduomqcc9RVx7Z29hYwAfYxsemA'; // 硬编码的手续费钱包地址

    // 只在交易类型为"buy"时处理手续费
    if (type !== 'buy') {
      return res.status(400).json({ error: '只有买入交易需要支付手续费' });
    }

    // 从数据库获取用户的私钥
    const user = await User.findById(userId);
    if (!user || !user.solWalletPrivateKey) {
      return res.status(404).json({ error: '用户或私钥未找到' });
    }

    // 创建 Solana 连接
    const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('mainnet-beta'));

    // 创建发送方的 Keypair
    const fromKeypair = solanaWeb3.Keypair.fromSecretKey(bs58.decode(user.solWalletPrivateKey));

    // 创建接收方的 PublicKey
    const toPublicKeyObj = new solanaWeb3.PublicKey(FEE_WALLET_ADDRESS);

    // 计算手续费金额（以 lamports 为单位）
    const feeAmount = Math.floor(amount * solanaWeb3.LAMPORTS_PER_SOL);

    // 创建交易
    const transaction = new solanaWeb3.Transaction().add(
      solanaWeb3.SystemProgram.transfer({
        fromPubkey: fromKeypair.publicKey,
        toPubkey: toPublicKeyObj,
        lamports: feeAmount,
      })
    );

    // 获取最新的区块哈希
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = fromKeypair.publicKey;

    // 签名并发送交易
    const signedTransaction = await solanaWeb3.sendAndConfirmTransaction(
      connection,
      transaction,
      [fromKeypair]
    );

    res.json({ 
      message: '手续费交易成功',
      signature: signedTransaction,
      feeAmount: amount,
      feeWallet: FEE_WALLET_ADDRESS
    });
  } catch (error) {
    console.error('发送手续费交易错误:', error);
    res.status(500).json({ error: '发送手续费交易失败', details: error.message });
  }
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: '服务器内部错误，请稍后重试' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));