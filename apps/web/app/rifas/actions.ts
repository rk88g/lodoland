"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isEmailConfirmed, requireUser } from "../../lib/auth/session";
import { setFlashMessage } from "../../lib/flash";
import { reserveRaffleNumbers, confirmRaffleReservationPurchase } from "../../lib/raffle-sales";
import { createClient } from "../../lib/supabase/server";

const FLASH_COOKIE = "customer-raffles-flash";

function redirectWithMessage(type: "success" | "error", message: string): never {
  setFlashMessage(FLASH_COOKIE, { type, message });
  redirect("/rifas");
}

export async function reserveCustomerRaffleNumbersAction(formData: FormData) {
  const session = await requireUser();

  if (!isEmailConfirmed(session.user)) {
    redirectWithMessage("error", "Confirma tu correo para comprar numeros de rifa.");
  }

  const raffleId = String(formData.get("raffleId") ?? "").trim();
  const quantity = Number(String(formData.get("quantity") ?? "1").trim() || 1);
  const selectionMode = String(formData.get("selectionMode") ?? "manual").trim() === "random" ? "random" : "manual";
  const manualNumbers = String(formData.get("manualNumbers") ?? "").trim();
  const purchaserName =
    [session.profile?.first_name, session.profile?.last_name].filter(Boolean).join(" ").trim() || session.profile?.email || "Cliente";
  const purchaserEmail = session.profile?.email || session.user.email || null;
  const purchaserPhone = session.profile?.phone || null;

  if (!raffleId || quantity < 1) {
    redirectWithMessage("error", "Debes indicar la rifa y la cantidad.");
  }

  const supabase = createClient();

  try {
    const { reservation, reusedExisting } = await reserveRaffleNumbers({
      supabase,
      raffleId,
      quantity,
      selectionMode,
      manualNumbersRaw: manualNumbers,
      reservedForUserId: session.user.id,
      createdByUserId: session.user.id,
      purchaserName,
      purchaserEmail,
      purchaserPhone
    });

    revalidatePath("/rifas");
    if (reusedExisting) {
      redirectWithMessage("success", `Ya tenias numeros apartados: ${reservation.numbers.join(", ")}.`);
    }

    redirectWithMessage("success", `Tus numeros quedaron apartados 5 minutos: ${reservation.numbers.join(", ")}.`);
  } catch (error) {
    redirectWithMessage("error", error instanceof Error ? error.message : "No pudimos apartar tus numeros.");
  }
}

export async function confirmCustomerRaffleReservationAction(formData: FormData) {
  const session = await requireUser();

  if (!isEmailConfirmed(session.user)) {
    redirectWithMessage("error", "Confirma tu correo para comprar numeros de rifa.");
  }

  const raffleId = String(formData.get("raffleId") ?? "").trim();
  const quantityGroup = String(formData.get("quantityGroup") ?? "").trim();
  const purchaserName =
    [session.profile?.first_name, session.profile?.last_name].filter(Boolean).join(" ").trim() || session.profile?.email || "Cliente";
  const purchaserEmail = session.profile?.email || session.user.email || null;
  const purchaserPhone = session.profile?.phone || null;

  if (!raffleId || !quantityGroup) {
    redirectWithMessage("error", "No encontramos el apartado de esa rifa.");
  }

  const supabase = createClient();

  try {
    await confirmRaffleReservationPurchase({
      supabase,
      raffleId,
      quantityGroup,
      ownerUserId: session.user.id,
      createdByUserId: session.user.id,
      purchaserName,
      purchaserEmail,
      purchaserPhone,
      saleOrigin: "customer_raffle"
    });

    revalidatePath("/rifas");
    revalidatePath("/perfil");
    revalidatePath("/perfil/compras");
    revalidatePath("/admin/rifas");
    revalidatePath("/staff/rifas");
    redirectWithMessage("success", "Compra de rifa confirmada correctamente.");
  } catch (error) {
    redirectWithMessage("error", error instanceof Error ? error.message : "No pudimos confirmar la compra.");
  }
}
