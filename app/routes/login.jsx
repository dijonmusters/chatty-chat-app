import supabase from "~/utils/supabase";
import { Link } from "remix";

export default () => {
  const handleLogin = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const email = formData.get("email");
    const password = formData.get("password");

    const { error } = await supabase.auth.signIn({
      email,
      password,
    });

    if (error) {
      console.log(error.message);
    }
  };
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-800 text-white">
      <h1 className="text-4xl mb-4">Login</h1>
      <form className="flex flex-col mb-4" onSubmit={handleLogin}>
        <label htmlFor="email">Email</label>
        <input
          name="email"
          className="border border-gray-200 bg-transparent mb-4 px-2"
          placeholder="jon@example.com"
        />
        <label htmlFor="password">Password</label>
        <input
          type="password"
          name="password"
          className="border border-gray-200 bg-transparent mb-8 px-2"
          placeholder="password"
        />
        <button className="bg-gray-700 py-2">Go!</button>
      </form>
      <p>
        Don't have an account? <Link to="/register">Register 👉</Link>
      </p>
    </div>
  );
};
