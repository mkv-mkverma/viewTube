import Button from "./Button";

const List = [
  "All",
  "Live",
  "News",
  "Gaming",
  "Songs",
  "Cricket",
  "Cooking",
  "Wild",
  "Songs",
  "Hindi",
];

const ButtonList = () => {
  return (
    <div className="flex">
      {List && List.map((item, i) => <Button key={i} name={item} />)}
    </div>
  );
};

export default ButtonList;
