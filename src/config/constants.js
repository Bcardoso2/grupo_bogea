 
// server/src/config/constants.js
module.exports = {
  USER_ROLES: {
    ADMIN: 'admin',
    USER: 'user'
  },
  
  CLIENT_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive'
  },
  
  DOCUMENT_CATEGORIES: {
    CONTRACT: 'contract',
    PROPOSAL: 'proposal',
    INVOICE: 'invoice',
    REPORT: 'report',
    OTHER: 'other'
  },
  
  DOCUMENT_STATUS: {
    DRAFT: 'draft',
    ACTIVE: 'active',
    ARCHIVED: 'archived'
  },
  
  CONTRACT_STATUS: {
    DRAFT: 'draft',
    PENDING: 'pending',
    ACTIVE: 'active',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
  },
  
  PROJECT_STATUS: {
    PLANNING: 'planning',
    IN_PROGRESS: 'in_progress',
    ON_HOLD: 'on_hold',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
  },
  
  TASK_STATUS: {
    TO_DO: 'to_do',
    IN_PROGRESS: 'in_progress',
    REVIEW: 'review',
    COMPLETED: 'completed'
  },
  
  TASK_PRIORITY: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent'
  },

  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
  }
};