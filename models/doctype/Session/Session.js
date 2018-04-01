module.exports = {
    "name": "Session",
    "doctype": "DocType",
    "isSingle": 0,
    "isChild": 0,
    "keywordFields": [],
    "fields": [
        {
            "fieldname": "name",
            "label": "Session ID",
            "fieldtype": "Code",
            "hidden": 0
        },
        {
            "fieldname": "username",
            "label": "Username",
            "fieldtype": "Link",
            "target": "User"
        },
        {
            "fieldname": "session",
            "label": "Session Data",
            "fieldtype": "Code",
            "hidden": 0
        },
        {
            "fieldname": "headers",
            "label": "Request Headers",
            "fieldtype": "Code",
            "hidden": 0
        },
        {
            "fieldname": "clientId",
            "label": "Client ID",
            "fieldtype": "Link",
            "target": "OAuthClient",
            "hidden": 0
        },
        {
            "fieldname": "accessToken",
            "label": "Access Token",
            "fieldtype": "Code",
            "hidden": 0
        },
        {
            "fieldname": "refreshToken",
            "label": "Refresh Token",
            "fieldtype": "Code",
            "hidden": 0
        },
        {
            "fieldname": "scopes",
            "label": "Scopes",
            "fieldtype": "Code",
            "hidden": 0
        },
        {
            "fieldname": "expirationTime",
            "label": "Expiration Time",
            "fieldtype": "Data",
            "hidden": 0
        },
        {
            "fieldname": "expiry",
            "label": "Expiry",
            "fieldtype": "Int",
            "hidden": 0
        },
        {
            "fieldname": "authorizationCode",
            "label": "Authorization Code",
            "fieldtype": "Code",
            "hidden": 0
        },
        {
            "fieldname": "redirectUri",
            "label": "Redirect URI",
            "fieldtype": "Code",
            "hidden": 0
        }
    ]
}
