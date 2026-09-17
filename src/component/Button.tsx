const Button = ({ name }: { name: string }) => {
  return (
    <div>
      <button
        type="button"
        className="bg-gray-200 rounded-lg px-5 py-2 m-2 cursor-pointer"
      >
        {name}
      </button>
    </div>
  );
};

export default Button;
