$filePath = "c:\Users\Asus\Music\KamDhanda\server\controllers\user.js"
$content = Get-Content $filePath -Raw
$newExports = @"
module.exports = {
    handleSendOtp,
    handleLoginSendOtp,
    handleUserSignup,
    handleUserNormalLogin,
    handleGetCurrentUser,
    handleLogoutUser,
    handleChangePassword,
    handleAddProjectId,
    handlGetAllAppliedForm,
    handleGoogleAuth,
    handleUpdateProfile,
    handleUpdateProfilePic,
    handleUpdateResume,
    handleUpdatePublicKey,
    handleUpdateStatus,
    handleSendPhoneOtp,
    handlePhoneSignup,
    handlePhoneLogin
};
"@

$content = $content -replace 'module\.exports = \{[\s\S]*?\};', $newExports
Set-Content -Path $filePath -Value $content -NoNewline
