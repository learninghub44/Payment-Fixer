import { Router, Request, Response } from "express";
import { db } from "../db.js";
import { members } from "../shared/schema.js";
import { eq, ilike } from "drizzle-orm";

const router = Router();

// Register member
router.post("/", async (req: Request, res: Response) => {
  try {
    const {
      fullName,
      phone,
      email,
      category,
      institution,
      county,
      tier,
    } = req.body;

    // Validation
    const errors: Record<string, string> = {};

    if (!fullName?.trim()) errors.fullName = "Full name is required";
    if (!phone?.trim()) errors.phone = "Phone number is required";
    if (!email?.trim()) errors.email = "Email is required";
    if (!category?.trim()) errors.category = "Category is required";
    if (!institution?.trim()) errors.institution = "Institution is required";
    if (!county?.trim()) errors.county = "County is required";

    // Phone format validation
    const phoneRegex = /^(\+254|0)[17][0-9]{8}$/;
    if (phone && !phoneRegex.test(phone.replace(/\s/g, ""))) {
      errors.phone = "Invalid phone number format. Use +254 or 07/06";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      errors.email = "Invalid email format";
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        error: "Validation failed",
        details: errors,
      });
    }

    // Check for existing phone number
    const existingPhone = await db
      .select()
      .from(members)
      .where(eq(members.phone, phone.trim()))
      .limit(1);

    if (existingPhone.length > 0) {
      return res.status(409).json({
        error: "Phone number already registered",
        message: `The phone number ${phone} is already associated with an account. Please use a different number or log in if this is your account.`,
        field: "phone",
      });
    }

    // Check for existing email
    const existingEmail = await db
      .select()
      .from(members)
      .where(eq(members.email, email.toLowerCase()))
      .limit(1);

    if (existingEmail.length > 0) {
      return res.status(409).json({
        error: "Email already registered",
        message: `The email ${email} is already associated with an account. Please use a different email or log in if this is your account.`,
        field: "email",
      });
    }

    // Insert new member
    const newMember = await db
      .insert(members)
      .values({
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.toLowerCase().trim(),
        category: category.trim(),
        institution: institution.trim(),
        county: county.trim(),
        tier: tier || "Member",
        status: "Pending Payment",
      })
      .returning();

    res.status(201).json({
      success: true,
      message: "Registration successful. Proceed to payment.",
      member: {
        id: newMember[0].id,
        name: newMember[0].fullName,
        email: newMember[0].email,
        tier: newMember[0].tier,
      },
    });
  } catch (error: any) {
    console.error("Registration error:", error);

    if (error.code === "23505") {
      const field = error.constraint?.includes("phone")
        ? "phone"
        : error.constraint?.includes("email")
          ? "email"
          : "unknown";

      return res.status(409).json({
        error: "Duplicate account detected",
        message:
          field === "phone"
            ? "This phone number is already registered. Please try logging in or use a different number."
            : field === "email"
              ? "This email is already registered. Please try logging in or use a different email."
              : "This information is already registered.",
        field,
      });
    }

    res.status(500).json({
      error: "Registration failed",
      message: "An error occurred during registration. Please try again.",
    });
  }
});

// Get all members (admin only)
router.get("/", async (req: Request, res: Response) => {
  try {
    const allMembers = await db.select().from(members);
    res.json(allMembers);
  } catch (error) {
    console.error("Get members error:", error);
    res.status(500).json({ error: "Failed to fetch members" });
  }
});

// Update member status (admin only)
router.patch("/:id/status", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    // Ensure id is a string
    const memberId = Array.isArray(id) ? id[0] : id;

    const updated = await db
      .update(members)
      .set({ status })
      .where(eq(members.id, memberId))
      .returning();

    if (updated.length === 0) {
      return res.status(404).json({ error: "Member not found" });
    }

    res.json({
      success: true,
      message: "Member status updated",
      member: updated[0],
    });
  } catch (error) {
    console.error("Update member error:", error);
    res.status(500).json({ error: "Failed to update member status" });
  }
});

export default router;

// DELETE /api/members/:id
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "ID required" });
    const result = await pool.query(`DELETE FROM members WHERE id=$1 RETURNING id`, [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Member not found" });
    console.log("[Members] Deleted:", id);
    return res.json({ ok: true });
  } catch (e: any) {
    console.error("[Members] Delete error:", e.message);
    return res.status(500).json({ error: e.message });
  }
});
