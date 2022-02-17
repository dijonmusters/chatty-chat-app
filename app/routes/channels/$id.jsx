import { useLoaderData, Form, useFetcher, useTransition } from "remix";
import supabase from "~/utils/supabase";
import { useEffect, useState, useRef } from "react";
import withAuthRequired from "~/utils/withAuthRequired";

export const loader = withAuthRequired(
  async ({ params: { id }, supabase, user }) => {
    const { data: channel, error } = await supabase
      .from("channels")
      .select(
        "id, title, description, messages(id, content, likes, profiles(id, email, username))"
      )
      .match({ id })
      .order("created_at", { foreignTable: "messages" })
      .single();

    if (error) {
      console.log(error.message);
    }

    return {
      channel,
      user,
    };
  }
);

export const action = withAuthRequired(async ({ request, supabase, user }) => {
  const formData = await request.formData();
  const content = formData.get("content");
  const channelId = formData.get("channelId");

  const { error } = await supabase
    .from("messages")
    .insert({ content, channel_id: channelId, user_id: user.id });

  if (error) {
    console.log(error.message);
  }

  return null;
});

export default () => {
  const { channel, user } = useLoaderData();
  const [messages, setMessages] = useState([...channel.messages]);
  const fetcher = useFetcher();
  const transition = useTransition();
  const newMessageRef = useRef();
  const messagesRef = useRef();

  useEffect(() => {
    if (transition.state !== "submitting") {
      // reset our input
      newMessageRef.current?.reset();
    }
  }, [transition.state]);

  useEffect(() => {
    supabase
      .from(`messages:channel_id=eq.${channel.id}`)
      .on("*", (payload) => {
        // something changed
        // call the loader
        fetcher.load(`/channels/${channel.id}`);
      })
      .subscribe();
  }, []);

  useEffect(() => {
    if (fetcher.data) {
      setMessages([...fetcher.data.channel.messages]);
    }
  }, [fetcher.data]);

  useEffect(() => {
    setMessages([...channel.messages]);
  }, [channel]);

  useEffect(() => {
    messagesRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);

  const handleIncrement = (id) => async () => {
    // call increment function from postgres!
    const { data, error } = await supabase.rpc("increment_likes", {
      message_id: id,
    });

    console.log({ data, error });
  };

  return (
    <>
      <h1 className="text-2xl uppercase mb-2">{channel.title}</h1>
      <p className="text-gray-600 border-b border-gray-300 pb-6">
        {channel.description}
      </p>
      <div className="flex-1 flex flex-col p-2 overflow-auto">
        <div ref={messagesRef} className="mt-auto">
          {messages.length > 0 ? (
            messages.map((message) => (
              <p
                key={message.id}
                className={`p-2 ${
                  user.id === message.profiles.id ? "text-right" : ""
                }`}
              >
                {message.content}
                <span className="block text-xs text-gray-500 px-2">
                  {message.profiles.username ?? message.profiles.email}
                </span>
                <span className="block text-xs text-gray-500 px-2">
                  {message.likes} likes{" "}
                  <button onClick={handleIncrement(message.id)}>👍</button>
                </span>
              </p>
            ))
          ) : (
            <p className="font-bold text-center">
              Be the first to send a message!
            </p>
          )}
        </div>
      </div>
      <Form method="post" ref={newMessageRef} className="flex">
        <input name="content" className="border border-gray-200 px-2 flex-1" />
        <input type="hidden" name="channelId" value={channel.id} />
        <button className="px-4 py-2 ml-4 bg-blue-200">Send!</button>
      </Form>
    </>
  );
};
