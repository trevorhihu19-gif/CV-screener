import arcjet, { shield, tokenBucket, detectBot} from "@arcjet/node";
import { ARCJET_KEY } from "../config/env.js";

export const aj = arcjet({
  key: ARCJET_KEY,
  characteristics: ["ip.src"],
  rules: [
    // Shield blocks common attacks — SQLi, XSS etc
    shield({
      mode: "LIVE",
    }),
    // Bot protection — blocks automated scrapers and attackers
    detectBot({
      mode: "LIVE",
      allow: [
        "CATEGORY:SEARCH_ENGINE", // allow Google, Bing etc
      ],
    }),
    // Rate limiting — token bucket algorithm
    tokenBucket({
      mode: "LIVE",
      refillRate: 5,   // refill 20 tokens per interval
      interval: 10,     // every 60 seconds
      capacity: 10,     // max 40 tokens in bucket
    }),
  ],
});