const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');
const solanaWeb3 = require('@solana/web3.js');
const bs58 = require('bs58').default;
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
  solWalletPrivateKey: String
}));

// 生成 Solana 钱包并以 base58 格式编码私钥
function generateSolanaWallet() {
  const keyPair = solanaWeb3.Keypair.generate();
  return {
    publicKey: keyPair.publicKey.toString(),
    privateKey: bs58.encode(keyPair.secretKey)
  };
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
    
    const user = new User({
      username,
      password: hashedPassword,
      solWalletPublicKey: solanaWallet.publicKey,
      solWalletPrivateKey: solanaWallet.privateKey
    });
    
    await user.save();
    
    res.status(201).json({
      message: '注册成功',
      user: {
        id: user._id,
        username: user.username,
        solWalletPublicKey: user.solWalletPublicKey
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
        solWalletPublicKey: user.solWalletPublicKey
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ message: '登录失败，请稍后重试' });
  }
});

// 获取钱包私钥的路由
app.get('/api/wallet/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    if (!user.solWalletPrivateKey) {
      return res.status(404).json({ message: '用户没有关联的钱包' });
    }
    
    res.json({ privateKey: user.solWalletPrivateKey });
  } catch (error) {
    console.error('获取钱包私钥错误:', error);
    res.status(500).json({ message: '获取钱包私钥失败，请稍后重试' });
  }
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: '服务器内部错误，请稍后重试' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));