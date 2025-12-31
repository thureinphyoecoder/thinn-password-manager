import { bindCreateEvents } from "./events/create.js";
import { bindUnlockEvents } from "./events/unlock.js";
import { bindHomeEvents } from "./events/home.js";

import { bindAddItemEvents } from "./events/addItem.js";

export function bindEvents() {
  bindCreateEvents();
  bindUnlockEvents();
  bindHomeEvents();
  bindAddItemEvents();
}
