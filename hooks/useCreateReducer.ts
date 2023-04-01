import { useReducer, useMemo } from 'react';

// Extracts property names from initial state of reducer to allow typesafe dispatch objects
type ExtractStringPropertyNames<T> = {
	[K in keyof T]: T[K] extends string ? K : K;
}[keyof T];

// Returns the Action Type for the dispatch object to be used for typing in things like context
export type ActionType<T> =
	| { type: 'reset' }
	| { type: 'change'; field: ExtractStringPropertyNames<T>; value: any };

// Returns a typed dispatch and state
export const useCreateReducer = <T>({ initialState }: { initialState: T }) => {
	type Action =
		| { type: 'reset' }
		| { type: 'change'; field: ExtractStringPropertyNames<T>; value: any };

	const reducer = (state: T, action: Action) => {
		switch (action.type) {
			case 'change':
				return { ...state, [action.field]: action.value };
			case 'reset':
				return initialState;
			default:
				throw new Error();
		}
	};

	const [state, dispatch] = useReducer(reducer, initialState);

	const contextValue = useMemo(() => {
		return { state, dispatch };
	}, [state, dispatch]);

	return { ...contextValue };
};
