const OwnerVerificator = require('../OwnerVerificator');

describe('EncryptionHelper interface', () => {
  it('should throw error when invoke abstract behavior', async () => {
    // Arrange
    const ownerVerificator = new OwnerVerificator();

    // Action & Assert
    await expect(ownerVerificator.verifyOwner('dummy_thread', 'user_id')).rejects.toThrowError('OWNER_VERIFICATOR.METHOD_NOT_IMPLEMENTED');
  });
});
