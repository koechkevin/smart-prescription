export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
  ppb: {
    tokenUrl: process.env.PPB_TOKEN_URL || 'https://accounts.dha.go.ke/realms/hie/protocol/openid-connect/token',
    clientId: process.env.PPB_CLIENT_ID || '',
    clientSecret: process.env.PPB_CLIENT_SECRET || '',
    catalogUrl: process.env.PPB_CATALOG_URL || 'https://ilm-hie.dha.go.ke/adapter/facade/hie/api/v1/terminology-service',
    pageSize: parseInt(process.env.PPB_PAGE_SIZE || '50', 10),
  },
  icd: {
    baseUrl: process.env.ICD_BASE_URL || 'https://icd.tiberbu.health/icd/release/11/2025-01/mms',
  },
};
