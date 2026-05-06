const baseUrl = process.env.APP_URL || "http://localhost:3000";

async function check(path: string, expectedStatus = 200) {
  const response = await fetch(`${baseUrl}${path}`);
  const ok = response.status === expectedStatus;
  console.log(`${ok ? "PASS" : "FAIL"} ${path} status=${response.status}`);
  if (!ok) {
    throw new Error(`${path} returned ${response.status}, expected ${expectedStatus}`);
  }
  return response;
}

async function main() {
  const health = await check("/api/health");
  const healthJson = await health.json();
  console.log(`providers=${JSON.stringify(healthJson.providers)}`);

  const crops = await check("/api/crops");
  const cropsJson = await crops.json();
  if (!Array.isArray(cropsJson.crops) || cropsJson.crops.length === 0) {
    throw new Error("/api/crops returned no crops");
  }
  if (!Array.isArray(cropsJson.regions) || cropsJson.regions.length === 0) {
    throw new Error("/api/crops returned no regions");
  }
  console.log(`crops=${cropsJson.crops.length}; regions=${cropsJson.regions.length}`);

  await check("/login");
  await check("/register");
  await check("/offline");
  await check("/dashboard", 200);

  console.log("Smoke test completed");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
