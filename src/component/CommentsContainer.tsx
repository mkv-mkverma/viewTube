import Comments, { type CommentInfo } from "./Comments";

const COMMENTS: CommentInfo[] = [
  {
    name: "Manish",
    text: "Hello this is manish",
    reply: [
      {
        name: "Sudhir",
        text: "Hello this is Sudhir",
        reply: [],
      },
    ],
  },
  {
    name: "Ram",
    text: "Hello this is Ram",
    reply: [
      {
        name: "Mohit",
        text: "Hello this is Mohit",
        reply: [
          {
            name: "lala",
            text: "Hello this is lala",
            reply: [
              {
                name: "bala",
                text: "Hello this is bala",
                reply: [
                  {
                    name: "mala",
                    text: "Hello this is mala",
                    reply: [
                      {
                        name: "chacha",
                        text: "Hello this is chacha",
                        reply: [],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "Rashmi",
    text: "Hello this is Rashmi",
    reply: [],
  },
  {
    name: "Hanuman",
    text: "Hello this is Hanuman",
    reply: [],
  },
];

export const CommentsList = ({ comments }: { comments: CommentInfo[] }) => {
  if (!comments?.length) return;
  return comments.map((comment, i) => {
    return (
      <div key={i}>
        <Comments info={comment} />
        <div className="pl-6 ml-2 border-l-2">
          <CommentsList comments={comment.reply} />
        </div>
      </div>
    );
  });
};

const CommentsContainer = () => {
  return (
    <div className="p-2 ">
      <h1 className="font-bold">Comments:</h1>
      <CommentsList comments={COMMENTS} />
    </div>
  );
};

export default CommentsContainer;
