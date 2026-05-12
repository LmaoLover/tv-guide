import React, { useState, useMemo, memo, useEffect } from "react";
import Layout, { Row, Main, Container } from "components/layouts/WideStretched";
import Header from "components/headers/Underline";

// HTML entity decoder function (works both client and server side)
const decodeHtmlEntities = (text) => {
  if (typeof text !== "string") return "";
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#39;/g, "'");
};

const mapCategoryToEmoji = (category) => {
  const categoryToEmoji = {
    "TV Shows": "📺",
    "TV Show": "📺",
    "Tv Shows": "📺",
    "Tv Show": "📺",
    Soccer: "⚽",
    Cricket: "🏏",
    Tennis: "🎾",
    Motorsport: "🚘",
    Motorsports: "🚘",
    Boxing: "🥊",
    MMA: "👊🏽",
    WWE: "💪",
    "Combat sports": "🥋",
    Golf: "⛳",
    Snooker: "🎱",
    "Alpine Ski": "⛷️",
    Athletics: "🏃",
    "Aussie rules": "🏉",
    Baseball: "⚾",
    Basketball: "🏀",
    Biathlon: "🎿",
    "Cross Country": "🎿",
    Darts: "🎯",
    Futsal: "⚽",
    Handball: "🤾🏼",
    "Horse Racing": "🏇",
    "Ice Hockey": "🏒",
    Lacrosse: "🥍",
    "Rugby League": "🏉",
    "Rugby Union": "🏉",
    "Ski Jumping": "⛷️",
    Squash: "🏸",
    Badminton: "🏸",
    Volleyball: "🏐",
    Netball: "🏐",
    "Winter Sports": "❄️",
    "Water Polo": "🤽🏼",
    "Water polo": "🤽🏼",
    Waterpolo: "🤽🏼",
    "PPV Events": "💸",
    Cycling: "🚲",
    cycling: "🚲",
    "Table Tennis": "🏓",
    "Ice Skating": "⛸️",
    Gymnastics: "🤸🏽",
    "Sailing / Boating": "⛵",
    Bowling: "🎳",
    GAA: "🇮🇪",
    "American Football": "🏈",
    "Am. Football": "🏈",
    "Beach Soccer": "⚽",
    Weightlifting: "🏋🏽",
    Wrestling: "🤼🏼",
    "E-Sports": "🎮",
    ESports: "🎮",
    Equestrian: "🏇",
    Triathlon: "🏃🏻",
    Floorball: "🏑",
    "Water Sports": "💦",
    Climbing: "🧗",
    "Field Hockey": "🏑",
    Fencing: "🤺",
    "England EFL Trophy/England League Cup/Scottish Premiership": "⚽",
    "All Soccer Events": "⚽",
    NHL: "🏒",
    WNBA: "🏀",
    "Baseball (MLB)": "⚾",
  };
  return categoryToEmoji[category] || "";
};

// Memoized event component for better performance
const Event = memo(({ event, ukDate }) => {
  const { formattedTime, dayName } = useMemo(() => {
    // Get the correct date from the event.formattedDate property
    // which is set in the mergedData function
    if (!event.formattedDate) {
      return { formattedTime: event.time, dayName: "" };
    }

    // Convert from UK time to Eastern time
    const ukDateTime = new Date(event.formattedDate);
    const etDateTime = new Date(
      ukDateTime.toLocaleString("en-US", { timeZone: "America/New_York" }),
    );

    return {
      formattedTime: etDateTime.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      }),
      dayName: etDateTime.toLocaleDateString("en-US", { weekday: "long" }),
    };
  }, [event.formattedDate, event.time]);

  const getChannels = (event) => {
    if (!event?.channels || !Array.isArray(event.channels)) return [];
    return event.channels;
  };
  // Get category emoji if available (for NOW section)
  const categoryEmoji = event.category
    ? mapCategoryToEmoji(event.category)
    : "";
  // Decode event title to fix &amp; issues
  const decodedEventName = decodeHtmlEntities(event?.event || "No event name");

  return (
    <div className="p-4 border-b last:border-b-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
      <div className="flex flex-col md:flex-row items-start gap-4">
        <div className="w-40 font-medium text-gray-700 dark:text-gray-300">
          {`${dayName} ${formattedTime}`}
        </div>
        <div className="flex-1">
          <div className="font-medium text-lg mb-2">
            {categoryEmoji && <span className="mr-1">{categoryEmoji}</span>}
            {decodedEventName}
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {getChannels(event).map((channel) => (
              <a
                key={`${event.time}-${channel?.channel_id || Math.random()}`}
                href={`${process.env.NEXT_PUBLIC_DADDY_URL_PATTERN}${channel?.channel_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
              >
                {decodeHtmlEntities(channel?.channel_name || "Unknown Channel")}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

export default function Index({ guide }) {
  let scheduleData = guide;
  // Changed initial state to empty Set to make "NOW" collapsed by default
  const [expandedCategories, setExpandedCategories] = useState(new Set([]));
  const [currentTime, setCurrentTime] = useState(null);

  // Set up current time
  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Time comparisons for rollover detection
  const compareTimeStrings = (time1, time2) => {
    const [h1, m1] = time1.split(":").map(Number);
    const [h2, m2] = time2.split(":").map(Number);

    if (h1 < h2) return -1;
    if (h1 > h2) return 1;
    return m1 - m2;
  };

  // Early morning check (before 4 AM)
  const isEarlyMorningTime = (timeStr) => {
    const hour = parseInt(timeStr.split(":")[0], 10);
    return hour < 4;
  };

  // Check if one time is at least X hours later than another
  const isAtLeastHoursLaterTime = (time1, time2, hours = 6) => {
    const [h1, m1] = time1.split(":").map(Number);
    const [h2, m2] = time2.split(":").map(Number);

    const minutes1 = h1 * 60 + m1;
    const minutes2 = h2 * 60 + m2;

    return minutes2 - minutes1 >= hours * 60;
  };

  // Parse date from format like "Tuesday 11th March 2025 - Schedule Time UK GMT"
  const parseFullUkDateOld = (dateStr) => {
    // Extract the date components
    let day, month, year, weekdayName, dayOfMonth;
    // Standard usual date format
    let match = dateStr.match(/(\w+)\s+(\d+)[a-z]{2}\s+(\w+)\s+(\d{4})/);
    if (!match) {
      //annoying outlier format
      match = dateStr.match(/(\w+)\s+(\d+)[a-z]{2}\s+(\d{4})/);
      if (!match) return null;

      [, weekdayName, dayOfMonth, year] = match;
      const targetWeekday = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ].indexOf(weekdayName);
      const targetDay = parseInt(dayOfMonth, 10);

      // Get the current date in UTC
      let date = new Date();
      date.setUTCHours(0, 0, 0, 0);

      // Check yesterday, today, and next two days
      for (let offset = -1; offset <= 2; offset++) {
        let testDate = new Date(date);
        testDate.setUTCDate(testDate.getUTCDate() + offset);

        if (
          testDate.getUTCDay() === targetWeekday &&
          testDate.getUTCDate() === targetDay
        ) {
          return testDate;
        }
      }

      return null;
    } else {
      [, , day, month, year] = match;
      return new Date(`${month} ${day} ${year} 00:00 GMT`);
    }
  };

  // Parses various date formats like:
  // "Tuesday 11th March 2025 - Schedule Time UK GMT"
  // "Wednesday 15th Oct2025 - Schedule Time UK GMT"
  // And the outlier format without a month.
  const parseFullUkDate = (dateStr) => {
    // Regex 1: Handles the standard format AND the new format with a missing space.
    // The `\s?` makes the space between the month and year optional.
    const standardFormatRegex = /(\w+)\s+(\d+)[a-z]{2}\s+(\w+)\s?(\d{4})/;
    let match = dateStr.match(standardFormatRegex);

    if (match) {
      // This will successfully match:
      // "Tuesday 11th March 2025" -> month="March", year="2025"
      // "Wednesday 15th Oct2025"  -> month="Oct",   year="2025"
      const [, , /* weekday */ day, month, year] = match;
      // The `new Date()` constructor is smart enough to handle "March" and "Oct".
      return new Date(`${month} ${day} ${year} 00:00 GMT`);
    }

    // Regex 2: Handles the annoying outlier format with no month.
    // This only runs if the first, more specific regex fails.
    const outlierFormatRegex = /(\w+)\s+(\d+)[a-z]{2}\s+(\d{4})/;
    match = dateStr.match(outlierFormatRegex);

    if (match) {
      const [, weekdayName, dayOfMonth /* year */] = match;
      const targetWeekday = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ].indexOf(weekdayName);
      const targetDay = parseInt(dayOfMonth, 10);

      // If we couldn't find the weekday, it's an invalid string.
      if (targetWeekday === -1) return null;

      // Get the current date in UTC to check against
      let today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      // Check yesterday, today, and the next two days to find a matching date
      // This logic assumes the date is very close to the present.
      for (let offset = -1; offset <= 2; offset++) {
        let testDate = new Date(today);
        testDate.setUTCDate(testDate.getUTCDate() + offset);

        if (
          testDate.getUTCDay() === targetWeekday &&
          testDate.getUTCDate() === targetDay
        ) {
          return testDate; // Found a match!
        }
      }

      // If we looped and found no match, we can't determine the date.
      return null;
    }

    // If neither regex matched, the format is completely unknown.
    console.warn("Could not parse unknown date format:", dateStr);
    return null;
  };

  const mergedData = useMemo(() => {
    if (!scheduleData) return {};

    const mergedCategories = { NOW: [] };
    let uniqueEventId = 0;

    Object.entries(scheduleData).forEach(([ukDate, categories]) => {
      Object.entries(categories).forEach(([category, events]) => {
        // Clean category name (remove span tag)
        const cleanCategory = category.replace("</span>", "").trim();

        // Decode category names to fix potential HTML entities
        const decodedCategory = decodeHtmlEntities(cleanCategory);

        if (!mergedCategories[decodedCategory]) {
          mergedCategories[decodedCategory] = [];
        }

        // Parse the base date properly from the full UK date string
        const baseDate = parseFullUkDate(ukDate);
        if (!baseDate) return;

        let currentDate = new Date(baseDate);
        let previousTimeStr = null;
        let advanced = false;

        events.forEach((event) => {
          // Skip events with no channels
          if (
            !event.channels ||
            (Array.isArray(event.channels) && event.channels.length === 0) ||
            (typeof event.channels === "object" &&
              Object.keys(event.channels).length === 0)
          ) {
            return;
          }

          // Skip bad Tennis streams
          if (
            /WTA/.test(event.event) ||
            /ATP/.test(event.event) ||
            /DOUBLES/.test(event.event)
          )
            return null;

          const timeStr = event.time;
          const [hour, minute] = timeStr.split(":").map(Number);

          // Handle date rollovers based on the raw time strings
          if (
            previousTimeStr &&
            compareTimeStrings(timeStr, previousTimeStr) < 0 &&
            isEarlyMorningTime(timeStr) &&
            !advanced
          ) {
            // Time rolls back and it's early morning - we've crossed to next day
            currentDate = new Date(baseDate);
            currentDate.setUTCDate(currentDate.getUTCDate() + 1);
            advanced = true;
          } else if (
            advanced &&
            previousTimeStr &&
            isAtLeastHoursLaterTime(previousTimeStr, timeStr)
          ) {
            // We're in advanced mode but see a big time jump - reset to original date
            currentDate = new Date(baseDate);
            advanced = false;
          }

          // Create the datetime with the correct date and time
          let eventDateTime = new Date(currentDate);
          eventDateTime.setUTCHours(hour, minute, 0, 0);

          const enhancedEvent = {
            ...event,
            ukDate,
            sortTime: eventDateTime,
            uniqueId: uniqueEventId++,
            formattedDate: eventDateTime,
          };

          mergedCategories[decodedCategory].push(enhancedEvent);

          // Check if this event should be in the NOW category
          if (currentTime) {
            const hoursBefore = 3;
            const hoursAfter = 1;
            const timeWindowStart = new Date(
              currentTime.getTime() - hoursBefore * 60 * 60 * 1000,
            );
            const timeWindowEnd = new Date(
              currentTime.getTime() + hoursAfter * 60 * 60 * 1000,
            );

            if (
              eventDateTime >= timeWindowStart &&
              eventDateTime <= timeWindowEnd
            ) {
              mergedCategories.NOW.push({
                ...enhancedEvent,
                category: decodedCategory, // Add category info for NOW items
              });
            }
          }

          previousTimeStr = timeStr;
        });
      });
    });

    // Sort events within each category
    Object.keys(mergedCategories).forEach((category) => {
      mergedCategories[category].sort((a, b) => a.sortTime - b.sortTime);
    });

    return mergedCategories;
  }, [scheduleData, currentTime]);

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(category)) {
        newExpanded.delete(category);
      } else {
        newExpanded.add(category);
      }
      return newExpanded;
    });
  };

  return (
    <Layout className="bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
      <Row>
        <Container>
          <Header />
        </Container>
      </Row>
      <Main>
        <Container>
          <div className="py-6">
            <div className="mb-4">
              {scheduleData ? (
                <div className="w-full">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold flex items-center">
                      <span className="mr-2">📺</span> Daddy Links
                      {currentTime && (
                        <span className="ml-auto text-sm font-normal">
                          Current time:{" "}
                          {currentTime.toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                            timeZone: "America/New_York",
                          })}{" "}
                          ET
                        </span>
                      )}
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {Object.entries(mergedData).map(([category, events]) => {
                        // Skip empty categories
                        if (events.length === 0) return null;

                        // Clean category name (remove span tag) and get emoji
                        const cleanCategory =
                          category === "NOW"
                            ? category
                            : category.replace("</span>", "").trim();

                        const categoryEmoji =
                          cleanCategory === "NOW"
                            ? "🔴"
                            : mapCategoryToEmoji(cleanCategory);

                        // Format category name with emoji
                        const decodedCategoryName =
                          cleanCategory === "NOW"
                            ? "🔴 HAPPENING NOW"
                            : `${categoryEmoji} ${decodeHtmlEntities(cleanCategory)}`;

                        //Skip weird tennis cats
                        if (
                          /Tennis [A-Z]{3}/.test(cleanCategory) ||
                          /WTA/.test(cleanCategory) ||
                          /ATP/.test(cleanCategory) ||
                          /DOUBLES/.test(cleanCategory)
                        )
                          return null;

                        return (
                          <div
                            key={category}
                            className="rounded-lg overflow-hidden"
                          >
                            <button
                              onClick={() => toggleCategory(category)}
                              className={`flex items-center w-full text-left text-lg font-semibold p-4 transition-colors ${
                                category === "NOW"
                                  ? "bg-blue-700 text-white dark:bg-blue-800"
                                  : "bg-gray-100 dark:bg-gray-800"
                              }`}
                            >
                              <span className="mr-2">
                                {expandedCategories.has(category) ? "▼" : "▶"}
                              </span>
                              {decodedCategoryName}
                              <span className="ml-2 text-sm font-normal">
                                ({events.length} events)
                              </span>
                            </button>
                            {expandedCategories.has(category) && (
                              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                {events.map((event) => {
                                  return (
                                    <div
                                      key={event.uniqueId}
                                      className="bg-white dark:bg-gray-800"
                                    >
                                      <Event
                                        event={event}
                                        ukDate={event.ukDate}
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full rounded-lg border shadow-xs p-6 bg-white dark:bg-gray-800">
                  <p className="text-lg font-medium">
                    No schedule data available
                  </p>
                </div>
              )}
            </div>
          </div>
        </Container>
      </Main>
    </Layout>
  );
}

// Module-level cache
let _daddyCache = {
  data: null,
  timestamp: 0,
};

// Promise to track ongoing fetch
let _currentFetchPromise = null;

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.3 Safari/605.1.15",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/117.0",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
];

const CACHE_EXPIRY = 6 * 3600 * 1000; // 6 hour in milliseconds

export async function getServerSidePropsOld({ res }) {
  let guide;
  try {
    const currentTime = Date.now();
    const cacheAge = currentTime - _daddyCache.timestamp;
    const cacheValid = _daddyCache.data !== null && cacheAge < CACHE_EXPIRY;

    if (cacheValid) {
      guide = _daddyCache.data;
    } else {
      // If a fetch is already in progress, wait for it
      if (_currentFetchPromise) {
        guide = await _currentFetchPromise;
      } else {
        const randomUserAgent =
          USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

        // Create and store the fetch promise
        _currentFetchPromise = fetch(process.env.DADDY_API_URL, {
          signal: AbortSignal.timeout(4000),
          headers: {
            Accept: "*/*",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "gzip, deflate",
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
            Priority: "u=1,i",
            Referer: process.env.DADDY_API_REFERER,
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "Sec-Gpc": "1",
            "User-Agent": randomUserAgent,
          },
        })
          .then((response) => response.json())
          .then((data) => {
            // Update cache
            _daddyCache = {
              data: data,
              timestamp: Date.now(),
            };
            return data;
          })
          .catch((error) => {
            console.log(error);
            if (error.name === "AbortError") {
              console.log("Timeout occurred");
            }
            throw error;
          })
          .finally(() => {
            // Clear the promise reference when done
            _currentFetchPromise = null;
          });

        // Wait for the fetch to complete
        guide = await _currentFetchPromise;
      }
    }

    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=600");
  } catch (TimeoutError) {
    guide = null;
  }

  return {
    props: {
      guide,
    },
  };
}

import { Impit } from "impit";

// Create one shared instance of Impit. This is efficient as it manages connection pools.
const impit = new Impit({
  // Use a Chrome profile for TLS impersonation. This is the key part.
  browser: "chrome",
});

export async function getServerSideProps({ res }) {
  let guide;
  try {
    const currentTime = Date.now();
    const cacheAge = currentTime - _daddyCache.timestamp;
    const cacheValid = _daddyCache.data !== null && cacheAge < CACHE_EXPIRY;

    if (cacheValid) {
      guide = _daddyCache.data;
    } else {
      if (_currentFetchPromise) {
        guide = await _currentFetchPromise;
      } else {
        const fetchWithImpit = async () => {
          try {
            // console.log("Attempting fetch with the correct tool: Impit...");

            // These are the perfect headers we discovered from your browser.
            const browserHeaders = {
              accept:
                "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
              "accept-language": "en-US,en;q=0.8",
              "cache-control": "no-cache",
              pragma: "no-cache",
              priority: "u=0, i",
              referer: process.env.DADDY_API_REFERER, // Use your env variable
              "sec-ch-ua":
                '"Brave";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
              "sec-ch-ua-mobile": "?0",
              "sec-ch-ua-platform": '"Linux"',
              "sec-fetch-dest": "document",
              "sec-fetch-mode": "navigate",
              "sec-fetch-site": "same-origin",
              "sec-fetch-user": "?1",
              "sec-gpc": "1",
              "upgrade-insecure-requests": "1",
              "user-agent":
                "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
            };

            // Use the impit.fetch method. It mirrors the standard fetch API.
            const response = await impit.fetch(process.env.DADDY_API_URL, {
              headers: browserHeaders,
              // Use a standard AbortSignal for timeouts
              signal: AbortSignal.timeout(15000),
            });

            if (!response.ok) {
              throw new Error(
                `Fetch failed with status: ${response.status} ${response.statusText}`,
              );
            }

            const data = await response.json();

            _daddyCache = { data: data, timestamp: Date.now() };
            // console.log("✅✅✅ SUCCESS! Impit bypassed the protection.");
            return data;
          } catch (error) {
            // console.error("--- Impit fetch failed ---");
            // Check if it's a timeout from our AbortSignal
            if (error.name === "TimeoutError") {
              console.error("Request timed out via AbortSignal.");
            } else {
              // Otherwise, log the underlying error, which might be ETIMEDOUT again
              console.error(error.message);
              console.error(error.cause);
            }
            throw error;
          } finally {
            _currentFetchPromise = null;
          }
        };

        _currentFetchPromise = fetchWithImpit();
        guide = await _currentFetchPromise;
      }
    }

    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=600");
  } catch (error) {
    console.log(
      "An error occurred in getServerSideProps, setting guide to null.",
    );
    guide = null;
  }

  return {
    props: { guide },
  };
}
