export async function readOnChainProduct(nft, tokenId) {
    if (!nft)
        return null;
    try {
        const id = BigInt(tokenId);
        const raw = await nft.getProduct(id);
        const meta = raw;
        const owner = (await nft.ownerOf(id));
        return {
            gtin: meta.gtin,
            serial: meta.serial,
            batchId: meta.batchId.toString(),
            createdAt: Number(meta.createdAt),
            isVerified: meta.isVerified,
            owner,
        };
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=blockchainService.js.map