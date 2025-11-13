function generateObjectId() {
    const timestamp = Math.floor(Date.now() / 1000).toString(16);
    const random = [...Array(16)]
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join('');
    return timestamp + random;
}

module.exports = {
    generateObjectId,
};