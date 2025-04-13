// Export Swagger documentation as a JavaScript object
export default {
  "openapi": "3.0.0",
  "info": {
    "title": "SoZayn API",
    "description": "API for SoZayn restaurant management platform",
    "version": "1.0.0",
    "contact": {
      "email": "api@sozayn.com"
    }
  },
  "servers": [
    {
      "url": "https://api.sozayn.com",
      "description": "Production API"
    },
    {
      "url": "https://api-staging.sozayn.com",
      "description": "Staging API"
    }
  ],
  "tags": [
    {
      "name": "health",
      "description": "Health check endpoints"
    },
    {
      "name": "integrations",
      "description": "Integration management"
    },
    {
      "name": "delivery",
      "description": "Delivery operations"
    }
  ],
  "paths": {
    "/health": {
      "get": {
        "tags": ["health"],
        "summary": "Health check endpoint",
        "description": "Returns health status of the API",
        "responses": {
          "200": {
            "description": "Health status",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "status": {
                      "type": "string",
                      "example": "ok"
                    },
                    "version": {
                      "type": "string",
                      "example": "1.0.0"
                    },
                    "timestamp": {
                      "type": "string",
                      "format": "date-time"
                    },
                    "environment": {
                      "type": "string",
                      "example": "production"
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/integrations": {
      "get": {
        "tags": ["integrations"],
        "summary": "Get all integrations",
        "description": "Returns all integrations for the authenticated user",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "name": "type",
            "in": "query",
            "description": "Filter integrations by type",
            "schema": {
              "type": "string",
              "enum": ["uber_direct", "jetgo"]
            }
          }
        ],
        "responses": {
          "200": {
            "description": "List of integrations",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/Integration"
                  }
                }
              }
            }
          },
          "401": {
            "description": "Unauthorized",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          }
        }
      },
      "post": {
        "tags": ["integrations"],
        "summary": "Create a new integration",
        "description": "Creates a new integration for the authenticated user",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/IntegrationInput"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Created integration",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Integration"
                }
              }
            }
          },
          "401": {
            "description": "Unauthorized",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "500": {
            "description": "Server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          }
        }
      }
    },
    "/api/integrations/{id}": {
      "parameters": [
        {
          "name": "id",
          "in": "path",
          "required": true,
          "description": "Integration ID",
          "schema": {
            "type": "integer"
          }
        }
      ],
      "patch": {
        "tags": ["integrations"],
        "summary": "Update an integration",
        "description": "Updates an existing integration",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/IntegrationInput"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Updated integration",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Integration"
                }
              }
            }
          },
          "401": {
            "description": "Unauthorized",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "404": {
            "description": "Integration not found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "500": {
            "description": "Server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          }
        }
      },
      "delete": {
        "tags": ["integrations"],
        "summary": "Delete an integration",
        "description": "Deletes an existing integration",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "responses": {
          "200": {
            "description": "Success response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": {
                      "type": "boolean",
                      "example": true
                    }
                  }
                }
              }
            }
          },
          "401": {
            "description": "Unauthorized",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "404": {
            "description": "Integration not found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "500": {
            "description": "Server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          }
        }
      }
    },
    "/api/integrations/{id}/test": {
      "parameters": [
        {
          "name": "id",
          "in": "path",
          "required": true,
          "description": "Integration ID",
          "schema": {
            "type": "integer"
          }
        }
      ],
      "post": {
        "tags": ["integrations"],
        "summary": "Test an integration",
        "description": "Tests the connection to an integration",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "responses": {
          "200": {
            "description": "Test result",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": {
                      "type": "boolean",
                      "example": true
                    },
                    "message": {
                      "type": "string",
                      "example": "Integration test successful"
                    }
                  }
                }
              }
            }
          },
          "401": {
            "description": "Unauthorized",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "404": {
            "description": "Integration not found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "500": {
            "description": "Server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          }
        }
      }
    },
    "/api/delivery/stats": {
      "get": {
        "tags": ["delivery"],
        "summary": "Get delivery statistics",
        "description": "Returns statistics about deliveries for the authenticated user",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "responses": {
          "200": {
            "description": "Delivery statistics",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "total": {
                      "type": "integer",
                      "example": 150
                    },
                    "completed": {
                      "type": "integer",
                      "example": 120
                    },
                    "inProgress": {
                      "type": "integer",
                      "example": 25
                    },
                    "cancelled": {
                      "type": "integer",
                      "example": 5
                    },
                    "avgDeliveryTime": {
                      "type": "integer",
                      "example": 28
                    }
                  }
                }
              }
            }
          },
          "401": {
            "description": "Unauthorized",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "500": {
            "description": "Server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "Integration": {
        "type": "object",
        "properties": {
          "id": {
            "type": "integer",
            "format": "int64",
            "example": 1
          },
          "user_id": {
            "type": "string",
            "example": "user123"
          },
          "name": {
            "type": "string",
            "example": "UberDirect Main Account"
          },
          "type": {
            "type": "string",
            "enum": ["uber_direct", "jetgo"],
            "example": "uber_direct"
          },
          "credentials": {
            "type": "object",
            "properties": {
              "api_key": {
                "type": "string",
                "example": "api_key_123"
              },
              "merchant_id": {
                "type": "string",
                "example": "merchant_123"
              },
              "webhook_secret": {
                "type": "string",
                "example": "wh_secret_123"
              }
            }
          },
          "settings": {
            "type": "object",
            "properties": {
              "auto_dispatch": {
                "type": "boolean",
                "example": true
              },
              "webhook_url": {
                "type": "string",
                "example": "https://example.com/webhook"
              }
            }
          },
          "status": {
            "type": "string",
            "enum": ["active", "inactive", "testing"],
            "example": "active"
          },
          "created_at": {
            "type": "string",
            "format": "date-time"
          },
          "updated_at": {
            "type": "string",
            "format": "date-time"
          }
        }
      },
      "IntegrationInput": {
        "type": "object",
        "required": ["name", "type", "credentials"],
        "properties": {
          "name": {
            "type": "string",
            "example": "UberDirect Main Account"
          },
          "type": {
            "type": "string",
            "enum": ["uber_direct", "jetgo"],
            "example": "uber_direct"
          },
          "credentials": {
            "type": "object",
            "properties": {
              "api_key": {
                "type": "string",
                "example": "api_key_123"
              },
              "merchant_id": {
                "type": "string",
                "example": "merchant_123"
              },
              "webhook_secret": {
                "type": "string",
                "example": "wh_secret_123"
              }
            }
          },
          "settings": {
            "type": "object",
            "properties": {
              "auto_dispatch": {
                "type": "boolean",
                "example": true
              },
              "webhook_url": {
                "type": "string",
                "example": "https://example.com/webhook"
              }
            }
          },
          "status": {
            "type": "string",
            "enum": ["active", "inactive", "testing"],
            "example": "active"
          }
        }
      },
      "Error": {
        "type": "object",
        "properties": {
          "error": {
            "type": "string",
            "example": "Unauthorized"
          },
          "requestId": {
            "type": "string",
            "example": "d290f1ee-6c54-4b01-90e6-d701748f0851"
          }
        }
      }
    },
    "securitySchemes": {
      "bearerAuth": {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT"
      }
    }
  }
};