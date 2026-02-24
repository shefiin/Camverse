const REFERRAL_TOKEN_PREFIX = 'CAMRF';
const REFERRER_REWARD = 500;
const REFEREE_REWARD = 200;

const normalizeReferralCode = (code) => {
    if (typeof code !== 'string') return '';
    return code.trim().toUpperCase();
};

const randomDigits = (length = 6) => {
    const min = 10 ** (length - 1);
    const max = (10 ** length) - 1;
    return Math.floor(min + Math.random() * (max - min + 1));
};

const generateCandidateReferralToken = () => {
    return `${REFERRAL_TOKEN_PREFIX}${randomDigits(6)}`;
};

const generateUniqueReferralToken = async (UserModel, maxAttempts = 25) => {
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        const candidate = generateCandidateReferralToken();
        const exists = await UserModel.exists({ referralToken: candidate });
        if (!exists) return candidate;
    }
    throw new Error('Unable to generate unique referral token');
};

const getOrCreateWallet = async (WalletModel, userId) => {
    let wallet = await WalletModel.findOne({ user: userId });
    if (!wallet) {
        wallet = new WalletModel({
            user: userId,
            balance: 0,
            transactions: []
        });
    }
    return wallet;
};

const applyReferralRewards = async ({
    referralCode,
    newUser,
    UserModel,
    WalletModel
}) => {
    const normalizedCode = normalizeReferralCode(referralCode);
    if (!normalizedCode || !newUser) {
        return { applied: false, reason: 'missing-data' };
    }

    if (newUser.referredBy) {
        return { applied: false, reason: 'already-referred' };
    }

    const referrer = await UserModel.findOne({ referralToken: normalizedCode });
    if (!referrer) {
        return { applied: false, reason: 'invalid-code' };
    }

    if (String(referrer._id) === String(newUser._id)) {
        return { applied: false, reason: 'self-referral' };
    }

    const referrerWallet = await getOrCreateWallet(WalletModel, referrer._id);
    referrerWallet.balance += REFERRER_REWARD;
    referrerWallet.transactions.push({
        type: 'CREDIT',
        amount: REFERRER_REWARD,
        description: `Referral bonus for inviting ${newUser.email}`,
        date: new Date()
    });
    await referrerWallet.save();

    const newUserWallet = await getOrCreateWallet(WalletModel, newUser._id);
    newUserWallet.balance += REFEREE_REWARD;
    newUserWallet.transactions.push({
        type: 'CREDIT',
        amount: REFEREE_REWARD,
        description: 'Referral signup bonus',
        date: new Date()
    });
    await newUserWallet.save();

    referrer.totalReferrals = Number(referrer.totalReferrals || 0) + 1;
    referrer.referralEarnings = Number(referrer.referralEarnings || 0) + REFERRER_REWARD;
    await referrer.save();

    newUser.referredBy = referrer._id;
    await newUser.save();

    return { applied: true, referrerId: referrer._id };
};

module.exports = {
    REFERRER_REWARD,
    REFEREE_REWARD,
    normalizeReferralCode,
    generateUniqueReferralToken,
    applyReferralRewards
};
