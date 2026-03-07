import {
    BlobServiceClient,
    StorageSharedKeyCredential,
    generateBlobSASQueryParameters,
    BlobSASPermissions,
    SASProtocol,
} from '@azure/storage-blob'
import crypto from 'crypto'

// ---------------------------------------------------------------------------
// Azure Blob Storage — Sovereign Vault (ap-southeast-2, Sydney)
// ---------------------------------------------------------------------------

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING || ''
const AZURE_STORAGE_CONTAINER_NAME = process.env.AZURE_STORAGE_CONTAINER_NAME || 'ndis-vault'

// ---------------------------------------------------------------------------
// Unique Filename Generator
// ---------------------------------------------------------------------------

export function generateUniqueName(originalFileName: string): string {
    const safeFileName = originalFileName.replace(/[^a-zA-Z0-9.-]/g, '_')
    const timestamp = Date.now()
    const shortId = crypto.randomBytes(4).toString('hex') // 8 char hex e.g. "a1b2c3d4"
    return `${timestamp}-${shortId}-${safeFileName}`
}

// ---------------------------------------------------------------------------
// Upload PDF to Azure Blob Storage (Private)
// ---------------------------------------------------------------------------

export async function uploadPdfToAzure(buffer: Buffer, storagePath: string): Promise<string | null> {
    if (!AZURE_STORAGE_CONNECTION_STRING) {
        console.warn('Azure Storage Connection String is missing. Cannot upload PDF.')
        return null
    }

    try {
        const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING)
        const containerClient = blobServiceClient.getContainerClient(AZURE_STORAGE_CONTAINER_NAME)

        // Ensure the container exists (useful for local dev or first run)
        await containerClient.createIfNotExists()

        const blockBlobClient = containerClient.getBlockBlobClient(storagePath)

        await blockBlobClient.uploadData(buffer, {
            blobHTTPHeaders: { blobContentType: 'application/pdf' },
            metadata: {
                region: 'ap-southeast-2',
                processed_by: 'PylonChat_Sovereign_AI',
            }
        })

        console.log(`[Azure Storage] Uploaded private blob: ${storagePath}`)
        return blockBlobClient.url
    } catch (error) {
        console.error('Azure Storage upload error:', error)
        return null
    }
}

// ---------------------------------------------------------------------------
// Download Private Blob as Buffer (SDK-only, no public URLs)
// ---------------------------------------------------------------------------

export async function downloadBlobAsBuffer(blobName: string): Promise<Buffer | null> {
    if (!AZURE_STORAGE_CONNECTION_STRING) {
        console.warn('Azure Storage Connection String is missing. Cannot download PDF.')
        return null
    }

    try {
        const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING)
        const containerClient = blobServiceClient.getContainerClient(AZURE_STORAGE_CONTAINER_NAME)
        const blockBlobClient = containerClient.getBlockBlobClient(blobName)

        console.log(`[Azure Storage] Downloading private blob to buffer: ${blobName}`)
        return await blockBlobClient.downloadToBuffer()
    } catch (error) {
        console.error('Azure Storage downloadToBuffer error:', error)
        return null
    }
}

// ---------------------------------------------------------------------------
// Generate Temporary SAS URL for Secure Download (1-hour expiry)
// ---------------------------------------------------------------------------

export function generateSasUrl(blobUrl: string): string | null {
    if (!AZURE_STORAGE_CONNECTION_STRING) {
        console.warn('Azure Storage Connection String is missing. Cannot generate SAS token.')
        return null
    }

    try {
        // Parse connection string to extract account name and key
        const connStringParts = parseConnectionString(AZURE_STORAGE_CONNECTION_STRING)
        const accountName = connStringParts.AccountName
        const accountKey = connStringParts.AccountKey

        if (!accountName || !accountKey) {
            console.error('[Azure Storage] Could not parse AccountName/AccountKey from connection string')
            return null
        }

        // Extract blob name from full URL
        const urlParts = new URL(blobUrl)
        const blobName = decodeURIComponent(
            urlParts.pathname.substring(`/${AZURE_STORAGE_CONTAINER_NAME}/`.length)
        )

        const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey)

        const sasToken = generateBlobSASQueryParameters(
            {
                containerName: AZURE_STORAGE_CONTAINER_NAME,
                blobName,
                permissions: BlobSASPermissions.parse('r'), // Read-only
                startsOn: new Date(Date.now() - 5 * 60 * 1000), // 5 min clock skew buffer
                expiresOn: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
                protocol: SASProtocol.Https,
            },
            sharedKeyCredential
        ).toString()

        return `${blobUrl}?${sasToken}`
    } catch (error) {
        console.error('Azure Storage SAS generation error:', error)
        return null
    }
}

// ---------------------------------------------------------------------------
// Extract blob name from a stored Azure URL
// ---------------------------------------------------------------------------

export function extractBlobName(blobUrl: string): string {
    const urlParts = new URL(blobUrl)
    return decodeURIComponent(
        urlParts.pathname.substring(`/${AZURE_STORAGE_CONTAINER_NAME}/`.length)
    )
}

// ---------------------------------------------------------------------------
// Simple Connection String Parser
// ---------------------------------------------------------------------------

function parseConnectionString(connectionString: string): Record<string, string> {
    const parts: Record<string, string> = {}
    connectionString.split(';').forEach(part => {
        const eqIndex = part.indexOf('=')
        if (eqIndex > -1) {
            const key = part.substring(0, eqIndex)
            const value = part.substring(eqIndex + 1)
            parts[key] = value
        }
    })
    return parts
}
