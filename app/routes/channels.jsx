import { useLoaderData, Link, Outlet, useLocation } from "remix";
import withAuthRequired from "~/utils/withAuthRequired";

export const loader = withAuthRequired(async ({ supabase }) => {
  const { data: channels, error } = await supabase
    .from("channels")
    .select("id, title");

  if (error) {
    console.log(error.message);
  }

  return {
    channels,
  };
});

export default () => {
  const { channels } = useLoaderData();
  const location = useLocation();

  return (
    <div className="h-screen flex">
      <div className="bg-gray-800 text-white w-40 p-8">
        {channels.map((channel) => (
          <p key={channel.id}>
            <Link to={`/channels/${channel.id}`}>
              <span className="text-gray-400 mr-1">#</span>
              {channel.title}
            </Link>
          </p>
        ))}
      </div>
      <div className="flex-1 p-8 flex flex-col">
        {location.pathname === "/channels" ||
        location.pathname === "/channels/" ? (
          <div className="flex-1 flex items-center justify-center text-center">
            👈 Choose a channel!
          </div>
        ) : null}
        <Outlet />
      </div>
    </div>
  );
};
