import React, { useState, useMemo, memo } from "react";
import Layout, { Row, Main, Container } from "components/layouts/WideStretched";
import Header from "components/headers/Underline";

// Memoized event component for better performance
const Event = memo(({ event, ukDate }) => {
  const { time, dayName } = useMemo(() => {
    const dateMatch = ukDate.match(/(\d{2})[a-z]{2}\s+(\w+)\s+(\d{4})/);
    if (!dateMatch) return { time: event.time, dayName: "" };

    const [, day, month, year] = dateMatch;
    const ukDateTime = new Date(`${month} ${day} ${year} ${event.time} GMT`);
    const etDateTime = new Date(
      ukDateTime.toLocaleString("en-US", { timeZone: "America/New_York" }),
    );

    return {
      time: etDateTime.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      }),
      dayName: etDateTime.toLocaleDateString("en-US", { weekday: "long" }),
    };
  }, [event.time, ukDate]);

  const getChannels = (event) => {
    if (!event?.channels || !Array.isArray(event.channels)) return [];
    return event.channels;
  };

  return (
    <div className="p-4 rounded-lg">
      <div className="flex items-start gap-4">
        {/*<div className="w-40 font-medium">{`${dayName} ${time}`}</div>*/}
        <div className="flex-1">
          <div className="font-medium mb-2">
            {event?.event || "No event name"}
          </div>
          <div className="flex flex-wrap gap-2">
            {getChannels(event).map((channel) => (
              <a
                key={`${event.time}-${channel?.channel_id || Math.random()}`}
                href={`${process.env.NEXT_PUBLIC_DADDY_URL_PATTERN}${channel?.channel_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-700"
              >
                {channel?.channel_name || "Unknown Channel"}
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
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  const mergedData = useMemo(() => {
    if (!scheduleData) return {};

    const mergedCategories = {};
    let uniqueEventId = 0; // For ensuring unique keys

    Object.entries(scheduleData).forEach(([ukDate, categories]) => {
      Object.entries(categories).forEach(([category, events]) => {
        if (!mergedCategories[category]) {
          mergedCategories[category] = [];
        }

        const convertedEvents = events.map((event) => {
          const dateMatch = ukDate.match(/(\d{2})[a-z]{2}\s+(\w+)\s+(\d{4})/);
          if (!dateMatch)
            return { ...event, ukDate, uniqueId: uniqueEventId++ };

          const [, day, month, year] = dateMatch;
          const ukDateTime = new Date(
            `${month} ${day} ${year} ${event.time} GMT`,
          );

          return {
            ...event,
            ukDate,
            sortTime: ukDateTime,
            uniqueId: uniqueEventId++,
          };
        });

        mergedCategories[category].push(...convertedEvents);
      });
    });

    // Sort events within each category
    Object.keys(mergedCategories).forEach((category) => {
      mergedCategories[category].sort((a, b) => a.sortTime - b.sortTime);
    });

    return mergedCategories;
  }, [scheduleData]);

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

  if (!scheduleData) {
    return (
      <div className="w-full rounded-lg border shadow-sm">
        <div className="p-6">
          <p>No schedule data available</p>
        </div>
      </div>
    );
  }

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

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
            <div className="">
              <div className="space-y-6">
                <div className="w-full">
                  <div className="px-6 pt-4">
                    <h2 className="text-2xl font-bold">
                      Daddy Links
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {Object.entries(mergedData).map(([category, events]) => (
                        <div key={category} className="space-y-2">
                          <button
                            onClick={() => toggleCategory(category)}
                            className="flex items-center w-full text-left text-lg font-semibold p-2 rounded-lg transition-colors"
                          >
                            <span className="mr-2">
                              {expandedCategories.has(category) ? "▼" : "▶"}
                            </span>
                            {category}
                          </button>
                          {expandedCategories.has(category) && (
                            <div className="space-y-2 pl-7">
                              {events.map((event) => (
                                <Event
                                  key={event.uniqueId}
                                  event={event}
                                  ukDate={event.ukDate}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Main>
    </Layout>
  );
}

export async function getServerSideProps({res}) {
  let guide;
  try {
    const js = await fetch(process.env.DADDY_API_URL, {
      signal: AbortSignal.timeout(4000),
    });
    guide = await js.json();
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=60");
  } catch (TimeoutError) {
    guide = null;
  }

  return {
    props: {
      guide,
    },
  };
}
