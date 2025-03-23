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
      <div className="flex items-start gap-4">
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
  const parseFullUkDate = (dateStr) => {
    // Extract the date components
    const match = dateStr.match(/(\w+)\s+(\d+)[a-z]{2}\s+(\w+)\s+(\d{4})/);
    if (!match) return null;

    const [, , day, month, year] = match;
    return new Date(`${month} ${day} ${year} 00:00 GMT`);
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
          <div className="px-4 py-6 sm:px-0">
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
                        if (/Tennis [A-Z]{3} - /.test(cleanCategory))
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

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.3 Safari/605.1.15",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/117.0",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
];

const CACHE_EXPIRY = 3600 * 1000; // 1 hour in milliseconds

export async function getServerSideProps({ res }) {
  let guide;
  try {
    const currentTime = Date.now();
    const cacheAge = currentTime - _daddyCache.timestamp;
    const cacheValid = _daddyCache.data !== null && cacheAge < CACHE_EXPIRY;

    if (cacheValid) {
      guide = _daddyCache.data;
    } else {
      const randomUserAgent =
        USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

      const js = await fetch(process.env.DADDY_API_URL, {
        signal: AbortSignal.timeout(4000),
        headers: {
          Accept: "*/*",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept-Encoding": "gzip, deflate",
          "Cache-Control": "no-cache",
          "Pragma": "no-cache",
          "Priority": "u=1,i",
          Referer: process.env.DADDY_API_REFERER,
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-origin",
          "Sec-Gpc": "1",
          "User-Agent": randomUserAgent,
        },
      });

      guide = await js.json();

      // Update cache
      _daddyCache = {
        data: guide,
        timestamp: currentTime,
      };
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
