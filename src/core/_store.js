// @ts-nocheck
import { writable } from 'svelte/store';

function createStore() {
	const { subscribe, update }  = writable({
		test:[123,321],
  });

	return {
		subscribe,
		set: (key,val) => update(store => {
			store[key] = val;
			return store;
		}),
		reset: () => set({})
	};
}

export const _store = createStore();