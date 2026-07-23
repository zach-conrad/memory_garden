/**
* 
* Defines user profile types and role-based access levels.
*
* Contains the data models used to rep. user profiles and roles that control
* administrative/testing features in MG. 
* @packageDocumentation
*/

export type Role = "admin" | "tester" | null;

export interface Profile {
  id: string;
  email: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  role: Role;
}