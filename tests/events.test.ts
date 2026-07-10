import assert from "node:assert/strict";
import test from "node:test";

import {
  getCompleteEvents,
  getCompletedEventKeys,
  getEventByRoute,
  getSkeletonEvents,
  routeSlugToSource,
  sourceToRouteSlug,
} from "../lib/events";

test("maps data sources to public route slugs", () => {
  assert.equal(sourceToRouteSlug("windows_security"), "windows-events");
  assert.equal(sourceToRouteSlug("sysmon"), "sysmon-events");
  assert.equal(routeSlugToSource("windows-events"), "windows_security");
  assert.equal(routeSlugToSource("sysmon-events"), "sysmon");
});

test("loads all skeleton events while marking completed records as linkable", () => {
  const skeleton = getSkeletonEvents();
  const completedKeys = getCompletedEventKeys();

  assert.equal(skeleton.length, 108);
  assert.equal(completedKeys.has("windows_security:4625"), true);
  assert.equal(completedKeys.has("sysmon:1"), true);
});

test("discovers complete event records from data/events", () => {
  const completeEvents = getCompleteEvents();

  assert.equal(completeEvents.length, 2);
  assert.equal(completeEvents.some((event) => event.id === "4625" && event.source === "windows_security"), true);
  assert.equal(completeEvents.some((event) => event.id === "1" && event.source === "sysmon"), true);
});

test("returns completed events by public route", () => {
  const windowsEvent = getEventByRoute("windows-events", "4625");
  const sysmonEvent = getEventByRoute("sysmon-events", "1");

  assert.equal(windowsEvent?.name, "An account failed to log on");
  assert.equal(sysmonEvent?.name, "Process creation");
});
