import { v5 as uuidv5 } from 'uuid';

// Define the same namespace UUID as in Java
const NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

export function generateUUIDFromUserId(userId) {
    return uuidv5(userId, NAMESPACE);
}

