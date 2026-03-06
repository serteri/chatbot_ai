import { BlobServiceClient } from '@azure/storage-blob'

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING || ''
const AZURE_STORAGE_CONTAINER_NAME = process.env.AZURE_STORAGE_CONTAINER_NAME || 'ndis-vault'

export async function uploadPdfToAzure(buffer: Buffer, storagePath: string): Promise<string | null> {
    if (!AZURE_STORAGE_CONNECTION_STRING) {
        console.warn('Azure Storage Connection String is missing. Cannot upload PDF.')
        return null
    }

    try {
        const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING)
        const containerClient = blobServiceClient.getContainerClient(AZURE_STORAGE_CONTAINER_NAME)

        // Ensure the container exists (useful for local dev or first run)
        await containerClient.createIfNotExists({ access: 'blob' })

        const blockBlobClient = containerClient.getBlockBlobClient(storagePath)

        await blockBlobClient.uploadData(buffer, {
            blobHTTPHeaders: { blobContentType: 'application/pdf' },
            metadata: {
                region: 'ap-southeast-2',
                processed_by: 'PylonChat_Sovereign_AI',
            }
        })

        return blockBlobClient.url
    } catch (error) {
        console.error('Azure Storage upload error:', error)
        return null
    }
}
