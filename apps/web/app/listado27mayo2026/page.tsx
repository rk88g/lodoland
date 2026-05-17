import { cookies } from "next/headers";
import { Box, Button } from "@mui/material";
import { FlashAlert } from "../../components/flash-alert";
import { Raffle27Experience } from "../../components/raffle27-experience";
import { readFlashMessage } from "../../lib/flash";
import {
  buildRaffle27WhatsAppHref,
  getRaffle27PublicData
} from "../../lib/raffle27";
import { claimRaffle27LuckyNumberAction } from "./actions";

export const dynamic = "force-dynamic";

const DEVICE_COOKIE = "raffle27-device";
const FLASH_COOKIE = "raffle27-public-flash";

export default async function Listado27Mayo2026Page() {
  const flash = readFlashMessage(FLASH_COOKIE);
  const deviceId = cookies().get(DEVICE_COOKIE)?.value || null;
  const publicData = await getRaffle27PublicData(deviceId);
  const luckyNumber = publicData.experience?.luckyNumber ?? null;
  const whatsappHref = buildRaffle27WhatsAppHref({
    whatsappNumber: publicData.settings.whatsapp_number,
    luckyNumber,
    prefix: "pay"
  });
  const receiptHref = buildRaffle27WhatsAppHref({
    whatsappNumber: publicData.settings.whatsapp_number,
    luckyNumber,
    prefix: "receipt"
  });

  return (
    <main className="raffle27-page">
      <div className="page-noise" />
      <div className="page-glow glow-left" />
      <div className="page-glow glow-right" />

      <Box className="raffle27-page-inner">
        <FlashAlert cookieName={FLASH_COOKIE} payload={flash} />

        <Box className="raffle27-composition">
          {!publicData.experience?.luckyNumber ? (
            <form action={claimRaffle27LuckyNumberAction} className="raffle27-claim-dock" method="post">
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
            whatsappHref={whatsappHref}
          />
        </Box>
      </Box>
    </main>
  );
}
