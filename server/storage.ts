import { type IStorage, type User, type InsertUser } from "./db-storage";
import { dbStorage } from "./db-storage";

// Export the database storage implementation
export { type IStorage, type User, type InsertUser } from "./db-storage";

export const storage: IStorage = dbStorage;
