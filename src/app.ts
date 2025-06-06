import "module-alias/register";
// import { User } from "@/types/index.ts";
import { check } from "@/types/check";
// import { check } from "./types/check";
import { checkUnit } from "@/tests/unit/checkUnit";
// import { check } from "@/tests/unit/check";

console.log("CHECK:", check());
console.log("CHECK UNIT:", checkUnit());

// const u: User = {
//   name: "John Doe",
//   email: "test@me.com",
//   createdAt: "2023-10-01T12:00:00Z",
// };

// console.log(
//   `User created: ${u.name}, Email: ${u.email}, Created At: ${u.createdAt}`
// );
