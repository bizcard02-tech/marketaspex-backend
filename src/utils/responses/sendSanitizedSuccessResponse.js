function SEND_SANITIZED_SUCCESS_RESPONSE(user) {
    const { password, __v, otp, otpExpiry, otpType, otpVerified, devices, createdAt, updatedAt, passCode, hubspot, ...rest } = user.toObject();
    return rest;
}
export default SEND_SANITIZED_SUCCESS_RESPONSE;
