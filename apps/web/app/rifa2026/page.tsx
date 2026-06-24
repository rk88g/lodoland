import { cookies } from "next/headers";
import { Box, Button } from "@mui/material";
import { FlashAlert } from "../../components/flash-alert";
import { Raffle27Experience } from "../../components/raffle27-experience";
import { readFlashMessage } from "../../lib/flash";
import {
  buildRaffle27WhatsAppHref,
  getRaffle27NumbersBoard,
  getRaffle27PublicData
} from "../../lib/raffle27";
import { claimRaffle27LuckyNumberAction } from "./actions";

export const dynamic = "force-dynamic";

const DEVICE_COOKIE = "raffle27-device";
const FLASH_COOKIE = "raffle27-public-flash";

export default async function Rifa2026Page() {
  const flash = readFlashMessage(FLASH_COOKIE);
  const deviceId = cookies().get(DEVICE_COOKIE)?.value || null;
  const [publicData, numberBoard] = await Promise.all([
    getRaffle27PublicData(deviceId),
    getRaffle27NumbersBoard()
  ]);
  const luckyNumber = publicData.experience?.luckyNumber ?? null;
  const soldNumbers = numberBoard.filter((row) => row.status === "sold").map((row) => row.number_value);
  const heldNumbers = numberBoard.filter((row) => row.status === "held").map((row) => row.number_value);
  const availableNumbers = numberBoard.filter((row) => row.status === "available").map((row) => row.number_value);
  const receiptHref = luckyNumber
    ? buildRaffle27WhatsAppHref({
        whatsappNumber: publicData.settings.whatsapp_number,
        luckyNumber,
        prefix: "receipt"
      })
    : null;

  return (
    <main className="raffle27-page">
      <div className="page-noise" />
      <div className="page-glow glow-left" />
      <div className="page-glow glow-right" />

      <Box className="raffle27-page-inner">
        <FlashAlert cookieName={FLASH_COOKIE} payload={flash} />

        <Box className="raffle27-composition">
          {!publicData.experience?.luckyNumber ? (
            <form action={claimRaffle27LuckyNumberAction} className="raffle27-claim-dock raffle27-claim-dock--pending" method="post">
              <span className="raffle27-focus-arrow" aria-hidden="true" />
              <Button size="large" type="submit" variant="contained">
                Girar mi suerte
              </Button>
            </form>
          ) : null}

          <Raffle27Experience
            availableCount={publicData.stats.available}
            countdownEndsAt={publicData.settings.countdown_ends_at}
            holdExpiresAt={publicData.experience?.holdExpiresAt ?? null}
            luckyNumber={publicData.experience?.luckyNumber ?? null}
            message={
              publicData.experience?.message ||
              "Activa la tombola y descubre el numero que te toca."
            }
            receiptHref={receiptHref}
            soldCount={publicData.stats.sold}
            totalCount={publicData.stats.total}
            transferInstructions={publicData.settings.transfer_instructions}
            numberBoard={{
              sold: soldNumbers,
              held: heldNumbers,
              available: availableNumbers
            }}
          />
        </Box>
      </Box>
    </main>
  );
}
