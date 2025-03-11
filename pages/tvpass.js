import Layout, { Row, Main, Container } from "components/layouts/WideStretched";
import Header from "components/headers/Underline";
import { useState, useEffect } from "react";
import channelIdMap from "../utils/channelIdMap";

export default function Index({ guide }) {
  const [currentTime, setCurrentTime] = useState(null);
  const [channelPrograms, setChannelPrograms] = useState([]);

  // Initialize currentTime and process programs on client-side only
  useEffect(() => {
    // Set initial time
    setCurrentTime(new Date());

    // Set up interval for time updates
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Process channel programs whenever currentTime or guide changes
  useEffect(() => {
    if (!currentTime || !guide) return;

    const processedChannels = guide.map((channel) => {
      const { current, next } = getChannelPrograms(channel.next_programs);

      const now_prog = current
        ? calculateProgress(
            current["data-listdatetime"],
            current["data-duration"],
          )
        : 0;

      const now_remaining = current
        ? calculateRemainingMinutes(
            current["data-listdatetime"],
            current["data-duration"],
          )
        : 0;

      return {
        ...channel,
        current,
        next,
        now_prog,
        now_starting: now_prog < 15,
        now_far_in: now_prog > 35 && now_prog <= 92,
        now_finishing: now_prog > 92,
        now_remaining,
      };
    });

    setChannelPrograms(processedChannels);
  }, [currentTime, guide]);

  // Helper function to convert UTC to Eastern Time
  const toEasternTime = (dateString) => {
    const date = new Date(dateString);
    const easternDate = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);

    return easternDate;
  };

  // Helper function to calculate progress percentage
  const calculateProgress = (startTimeStr, durationMinutes) => {
    if (!currentTime) return 0;

    const startTime = new Date(startTimeStr);
    const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

    if (currentTime < startTime) return 0;
    if (currentTime > endTime) return 100;

    const totalDuration = endTime - startTime;
    const elapsed = currentTime - startTime;
    return Math.floor((elapsed / totalDuration) * 100);
  };

  // Helper function to calculate minutes until start
  const calculateMinutesUntil = (startTimeStr) => {
    if (!currentTime || !startTimeStr) return 0;

    const startTime = new Date(startTimeStr);
    const diffMs = startTime - currentTime;
    return Math.max(0, Math.ceil(diffMs / 60000));
  };

  // Helper function to calculate remaining minutes
  const calculateRemainingMinutes = (startTimeStr, durationMinutes) => {
    if (!currentTime) return 0;

    const startTime = new Date(startTimeStr);
    const endTime = new Date(
      startTime.getTime() + parseInt(durationMinutes) * 60000,
    );
    const diffMs = endTime - currentTime;
    return Math.max(0, Math.ceil(diffMs / 60000));
  };

  // Find current and next program for a channel
  const getChannelPrograms = (programs) => {
    if (!programs || programs.length === 0 || !currentTime) {
      return { current: null, next: null };
    }

    let current = null;
    let next = null;

    for (let i = 0; i < programs.length; i++) {
      const program = programs[i];
      const startTime = new Date(program["data-listdatetime"]);
      const endTime = new Date(
        startTime.getTime() + parseInt(program["data-duration"]) * 60000,
      );

      if (currentTime >= startTime && currentTime < endTime) {
        current = { ...program, endTime };
        if (i + 1 < programs.length) {
          next = programs[i + 1];
        }
        break;
      } else if (startTime > currentTime) {
        if (!next) {
          next = program;
        }
      }
    }

    return { current, next };
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
            {!guide ? (
              <h1 className="text-2xl semibold">Guide DED</h1>
            ) : !currentTime ? (
              <div className="text-center py-4">Loading...</div>
            ) : (
              <div className="">
                {channelPrograms.map((channel) => {
                  // Get the channel ID from the mapping
                  const channelId = channelIdMap[channel.slug] || null;

                  return (
                    <div
                      key={channel.slug}
                      className="flex justify-between odd:bg-gray-200 dark:odd:bg-gray-800 py-2"
                    >
                      <div className="w-1/4 px-4 overflow-hidden flex flex-col justify-center mb-2">
                        <div className="font-bold text-center whitespace-nowrap">
                          {channel.title}
                        </div>
                        <div className="text-center text-sm space-x-2 mt-1">
                          {process.env.NEXT_PUBLIC_TVPASS && (
                            <a
                              href={`${process.env.NEXT_PUBLIC_TVPASS}${channel.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline font-medium"
                            >
                              TVPASS
                            </a>
                          )}
                          {process.env.NEXT_PUBLIC_LMAO && channelId && (
                            <a
                              href={`${process.env.NEXT_PUBLIC_LMAO}${channelId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline text-green-400 font-semibold"
                            >
                              LMAO
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="w-full pl-8 flex flex-col">
                        <div className="font-bold text-xl">
                          {channel.current?.["data-showname"] ||
                            "No program currently airing"}
                        </div>
                        {channel.current?.["data-episodetitle"] && (
                          <div className="text-sm italic">
                            {channel.current["data-episodetitle"]}
                          </div>
                        )}
                        <div className="dark:text-gray-300 flex-grow">
                          {channel.current?.["data-description"]?.slice(
                            0,
                            500,
                          ) || ""}
                        </div>
                        <div className="flex my-2">
                          <div
                            className={`text-2xl font-bold
                             ${!channel.now_prog ? "invisible" : ""}
                             ${channel.now_starting ? "dark:text-green-500" : ""}
                             ${channel.now_far_in ? "dark:text-red-800" : ""}
                             ${channel.now_finishing ? "dark:text-red-600" : ""}`}
                          >
                            {Math.floor(channel.now_prog)}% Done
                          </div>
                        </div>
                      </div>

                      <div
                        className={`w-full pl-8 flex flex-col ${!channel.next && "invisible"}`}
                      >
                        <div className="font-bold text-xl">
                          {channel.next?.["data-showname"] ||
                            "No upcoming program"}
                        </div>
                        {channel.next?.["data-episodetitle"] && (
                          <div className="text-sm italic">
                            {channel.next["data-episodetitle"]}
                          </div>
                        )}
                        <div className="dark:text-gray-300 flex-grow">
                          {channel.next?.["data-description"]?.slice(0, 500) ||
                            ""}
                        </div>
                        <div
                          className={`text-xl my-2
                           ${channel.now_remaining > 30 && "text-red-800"}
                           ${channel.now_remaining <= 15 && "text-green-500"}`}
                        >
                          Starting in{" "}
                          <span className="font-bold">
                            {calculateMinutesUntil(
                              channel.next?.["data-listdatetime"],
                            ) || ""}
                          </span>{" "}
                          minutes
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Container>
      </Main>
    </Layout>
  );
}

export async function getServerSideProps({ res }) {
  let guide;
  try {
    const js = await fetch(process.env.TVPASS_API_URL, {
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
