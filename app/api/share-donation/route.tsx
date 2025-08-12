/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import path from "path";
import { NextRequest } from "next/server";

// https://farcaster.xyz/flowstatecoop

const STYLES = {
  header: {
    marginTop: 2,
    marginLeft: 4,
    color: "#24292E",
    fontFamily: "Archivo",
    fontSize: "18px",
    lineHeight: "20px",
    fontStyle: "normal",
    fontWeight: 600,
    letterSpacing: "-0.09px",
  },
  sectionText: {
    color: "#679A8B",
    fontFamily: "Archivo",
    fontSize: "24px",
    fontStyle: "normal",
    fontWeight: 600,
    lineHeight: "22px",
    letterSpacing: "-0.09px",
    width: "200px",
  },
  detailText: {
    color: "#000000",
    fontFamily: "Archivo",
    fontSize: "12px",
    fontStyle: "normal",
    fontWeight: 600,
    lineHeight: "12px",
    letterSpacing: "-0.09px",
  },
  pfpImg: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    border: "3px",
    borderColor: "#679A8B",
  },
};

const archivoBuffer = readFileSync(
  path.join(process.cwd(), "static", "Archivo-Regular.ttf")
);

const archivoBlackBuffer = readFileSync(
  path.join(process.cwd(), "static", "Archivo-Black.ttf")
);

// Load logo as base64 (1.8KB file)
const logoBuffer = readFileSync(path.join(process.cwd(), "static", "icon.png"));
const logoBase64 = `data:image/png;base64,${logoBuffer.toString("base64")}`;

const devsBuffer = readFileSync(path.join(process.cwd(), "static", "devs.png"));
const devsBase64 = `data:image/png;base64,${devsBuffer.toString("base64")}`;

// const flowlineBuffer = readFileSync(path.join(process.cwd(), "static", "og-flowline.svg"));
// const devsBase64 = `data:image/png;base64,${devsBuffer.toString("base64")}`;

export async function GET(request: NextRequest) {
  try {
    /**
     * Fetch any data you want. You'll want to minimize latency here so avoid
     * or cache network requests where possible. Otherwise prefetch the image
     * so it gets generated and can be served from the CDN cache.
     *
     * In this example we grab data from the URL parameters which is a simple
     * and effective way to make parameterized templates.
     */
    const { searchParams } = new URL(request.url);
    let fid = searchParams.get("fid");
    if (!fid || fid === "undefined") {
      fid = "868887";
    }
    const flowRate = searchParams.get("flowRate");

    let user;

    const options = {
      method: "GET",
      headers: { "x-api-key": process.env.NEYNAR_API_KEY || "" },
    };

    const res = await fetch(
      `https://api.neynar.com/v2/farcaster/user/bulk/?fids=${fid}`,
      options
    );

    if (res.ok) {
      const users = await res.json();

      user = users.users[0];
    }

    return new ImageResponse(
      (
        <div
          tw="flex flex-row"
          style={{
            display: "flex",
            backgroundColor: "white",
            height: "100%",
            width: "100%",
            position: "relative",
          }}
        >
          <div tw="flex flex-col" style={{ padding: 20, display: "flex" }}>
            <div
              tw="flex flex-row items-center"
              style={{ display: "flex", marginBottom: "20px" }}
            >
              <img src={logoBase64} height={20} width={20} alt="logo" />
              <div style={STYLES.header}>flowcaster</div>
            </div>

            <div
              tw="flex flex-col w-full"
              style={{ display: "flex", gap: "10px" }}
            >
              <div style={STYLES.sectionText}>Stream Tokens</div>
              <div style={{ ...STYLES.sectionText, color: "#D95D39" }}>
                Support Farcaster Cracked Devs
              </div>
              <div style={{ ...STYLES.sectionText, color: "#75eb00" }}>
                Earn SUP
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  marginTop: "20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                  }}
                >
                  <img
                    style={STYLES.pfpImg}
                    src={user.pfp_url}
                    height={100}
                    width={100}
                    alt="pfp"
                  />
                  <svg
                    width="44"
                    height="22"
                    viewBox="0 0 44 22"
                    fill="none"
                    style={{
                      position: "absolute",
                      top: -3,
                      left: 100,
                      width: "60%",
                      height: "60%",
                      pointerEvents: "none",
                      opacity: ".85",
                    }}
                  >
                    <g filter="url(#filter0_f_124_10)">
                      <line
                        x1="3.05045"
                        y1="19.3739"
                        x2="41.3739"
                        y2="2.94955"
                        stroke="#D95D39"
                        stroke-width="4"
                        stroke-linecap="round"
                      />
                    </g>
                    <g opacity="0.85" filter="url(#filter1_f_124_10)">
                      <circle cx="14.5" cy="14.5" r="3.5" fill="#F3BDAB" />
                      <circle
                        cx="14.5"
                        cy="14.5"
                        r="3.4"
                        stroke="#D95D39"
                        stroke-width="0.2"
                      />
                    </g>
                    <defs>
                      <filter
                        id="filter0_f_124_10"
                        x="0.550781"
                        y="0.445312"
                        width="43.3242"
                        height="21.4297"
                        filterUnits="userSpaceOnUse"
                        color-interpolation-filters="sRGB"
                      >
                        <feFlood
                          flood-opacity="0"
                          result="BackgroundImageFix"
                        />
                        <feBlend
                          mode="normal"
                          in="SourceGraphic"
                          in2="BackgroundImageFix"
                          result="shape"
                        />
                        <feGaussianBlur
                          stdDeviation="0.25"
                          result="effect1_foregroundBlur_124_10"
                        />
                      </filter>
                      <filter
                        id="filter1_f_124_10"
                        x="10.75"
                        y="10.75"
                        width="7.5"
                        height="7.5"
                        filterUnits="userSpaceOnUse"
                        color-interpolation-filters="sRGB"
                      >
                        <feFlood
                          flood-opacity="0"
                          result="BackgroundImageFix"
                        />
                        <feBlend
                          mode="normal"
                          in="SourceGraphic"
                          in2="BackgroundImageFix"
                          result="shape"
                        />
                        <feGaussianBlur
                          stdDeviation="0.125"
                          result="effect1_foregroundBlur_124_10"
                        />
                      </filter>
                    </defs>
                  </svg>
                </div>

                <p
                  style={{
                    ...STYLES.detailText,
                    fontSize: "16px",
                    marginBottom: "0px",
                    color: "#679A8B",
                  }}
                >
                  {user.username}
                </p>
                {flowRate && (
                  <p style={{ ...STYLES.detailText, marginTop: "7px" }}>
                    is streaming {flowRate} USDCx / mo
                  </p>
                )}
                {!flowRate && (
                  <p style={{ ...STYLES.detailText, marginTop: "7px" }}>
                    is streaming USDCx
                  </p>
                )}
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <img src={devsBase64} height={350} width={350} alt="circle" />
          </div>
        </div>
      ),
      {
        width: 600,
        height: 400,
        headers: {
          /*
           * Cache headers for optimal performance:
           * - public: Allow caching by browsers and CDNs
           * - max-age=31536000: Browser cache for 1 year (maximum allowed)
           * - s-maxage=31536000: CDN cache for 1 year
           * - stale-while-revalidate: Serve stale content while fetching fresh
           *   content
           *
           * The header we use here will cause the image for any given URL to
           * be cached for a year; this is ideal for minimizing billing and
           * fast performance.
           *
           * You can adjust the parameters down if you want to periodically
           * update data in the image (for instance, if you wanted to include a
           * changing value like the number of mints on an NFT) but be mindful
           * of performance and billing considerations.
           */
          "Cache-Control":
            "public, max-age=31536000, s-maxage=31536000, stale-while-revalidate",
        },
        fonts: [
          {
            name: "Archivo",
            data: archivoBuffer,
            weight: 400,
            style: "normal",
          },
          {
            name: "Archivo",
            data: archivoBlackBuffer,
            weight: 900,
            style: "normal",
          },
        ],
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
