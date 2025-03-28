import Head from "next/head";
import Layout, { Row, Main, Container } from "components/layouts/WideStretched";
import Header from "components/headers/Underline";

export default function Index({ guide }) {
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
              {!guide ? (
                <h1 className="text-2xl semibold">Guide DED</h1>
              ) : (
                guide.result.channels.map((channel) => {
                  let now = channel?.broadcastnow;
                  let next = channel?.broadcastnext;

                  let now_prog = now?.progresspercentage || 0;
                  let now_starting = now_prog < 15;
                  let now_far_in = now_prog > 35 && now_prog <= 92;
                  let now_finishing = now_prog > 92;

                  let now_remaining = Math.floor(
                    (now?.runtime * 60 - now?.progress) / 60,
                  );

                  let thumbnail = decodeURIComponent(channel?.icon);

                  return (
                    <div
                      key={channel.channelid}
                      className="flex flex-col md:flex-row justify-between odd:bg-gray-200 dark:odd:bg-gray-800 py-2"
                    >
                      <div className="w-1/4 px-4 overflow-hidden flex flex-col justify-center mb-2">
                        <div className="max-w-24">
                          {thumbnail && (
                            <img src={thumbnail} alt="Channel Icon" />
                          )}
                        </div>
                        <div className="font-bold text-center whitespace-nowrap">
                          {channel?.channel}
                        </div>
                      </div>

                      <div className="w-full pl-8 flex flex-col">
                        <div className="font-bold text-xl">{now?.title}</div>
                        <div className="dark:text-gray-300 grow">
                          {now?.plot.slice(0, 500)}
                        </div>
                        <div className="flex my-2">
                          <div
                            className={`text-2xl font-bold
                           ${!now_prog ? "invisible" : ""}
                           ${now_starting ? "dark:text-green-500" : ""}
                           ${now_far_in ? "dark:text-red-800" : ""}
                           ${now_finishing ? "dark:text-red-600" : ""}`}
                          >
                            {Math.floor(now_prog)}% Done
                          </div>
                        </div>
                      </div>

                      <div
                        className={`w-full pl-8 flex flex-col ${!next && "invisible"}`}
                      >
                        <div className="font-bold text-xl">{next?.title}</div>
                        <div className="dark:text-gray-300 grow">
                          {next?.plot.slice(0, 500)}
                        </div>
                        <div
                          className={`text-xl my-2
                         ${now_remaining > 30 && "text-red-800"}
                         ${now_remaining <= 15 && "text-green-500"}`}
                        >
                          Starting in{" "}
                          <span className="font-bold">
                            {now_remaining || ""}
                          </span>{" "}
                          minutes
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </Container>
      </Main>
    </Layout>
  );
}

export async function getServerSideProps() {
  // Call an external API endpoint to get posts
  let guide;
  try {
    const res = await fetch(process.env.API_URL, {
      signal: AbortSignal.timeout(2000),
    });
    guide = await res.json();
  } catch (TimeoutError) {
    guide = null;
  }

  // By returning { props: { posts } }, the Blog component
  // will receive `posts` as a prop at build time
  return {
    props: {
      guide,
    },
  };
}
