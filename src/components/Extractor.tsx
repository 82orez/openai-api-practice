import React, { useEffect, useState } from "react";
import clsx from "clsx";

const RatingExtractor = ({ content }: { content: string }) => {
  const [inputString, setInputString] = useState(content);
  const [keyword, setKeyword] = useState("평점: ");
  const [rating, setRating] = useState("");

  const extractRating = () => {
    const regex = new RegExp(`${keyword}\\s*([\\d.]+)`);
    const match = inputString.match(regex);

    if (match) {
      setRating(match[1]);
    } else {
      setRating("평점을 찾을 수 없습니다.");
    }
  };

  useEffect(() => {
    extractRating();
  }, [content]);

  return (
    <div className={clsx("text-center text-xl font-bold", { hidden: !content })}>
      <p>발음 평가 점수: {rating}</p>
    </div>
  );
};

export default RatingExtractor;
