import { indicesOf, mergeRange } from "../utils";

export default function highlightChunks(
  text,
  highQueriesOrQuery,
  dicQueriesOrQuery,
  { caseSensitive = false, diacriticsSensitive = false } = {}
) {
  let highQueries = highQueriesOrQuery;
  if (
    typeof highQueriesOrQuery === "string" ||
    highQueriesOrQuery instanceof RegExp
  ) {
    highQueries = [highQueriesOrQuery];
  } else if (!Array.isArray(highQueriesOrQuery)) {
    if (process.env.NODE_ENV !== "production") {
      throw new Error(
        "queries must be either string, array of strings or regex."
      );
    } else {
      return [];
    }
  }

  let dicQueries = dicQueriesOrQuery;
  if (
    typeof dicQueriesOrQuery === "string" ||
    dicQueriesOrQuery instanceof RegExp
  ) {
    dicQueries = [dicQueriesOrQuery];
  } else if (!Array.isArray(dicQueriesOrQuery)) {
    if (process.env.NODE_ENV !== "production") {
      throw new Error(
        "queries must be either string, array of strings or regex."
      );
    } else {
      return [];
    }
  }
  const highMatches = [];
  const dicMatches = [];

  highQueries.forEach((query) => {
    highMatches.push(
      ...indicesOf(text, query, { caseSensitive, diacriticsSensitive })
    );
  });

  dicQueries.forEach((query) => {
    dicMatches.push(
      ...indicesOf(text, query, { caseSensitive, diacriticsSensitive })
    );
  });

  const highlights = mergeRange(highMatches);
  const dictionaries = mergeRange(dicMatches);

  console.log(highlights);
  console.log(dictionaries);

  const chunks = [];
  let lastEnd = 0;

  highlights.forEach(([start, end], index) => {
    if (lastEnd !== start) {
      chunks.push({
        isHighlighted: false,
        text: text.slice(lastEnd, start),
      });
    }
    chunks.push({
      isHighlighted: true,
      text: text.slice(start, end),
      highlightIndex: index,
    });

    lastEnd = end;
  });

  if (lastEnd !== text.length) {
    chunks.push({
      isHighlighted: false,
      text: text.slice(lastEnd),
    });
  }

  return chunks;
}
