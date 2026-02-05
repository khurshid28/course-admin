import { CSSProperties, useState } from "react";
import {
  BarLoader,
  CircleLoader,
  ClimbingBoxLoader,
  ClipLoader,
  HashLoader,
  PropagateLoader,
} from "react-spinners";

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};

type loadProps = {
  message?: string;
  size?: number;
};
export function LoadSpinner({ message = "Featching data", size = 100 }: loadProps) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center gap-10 ">
      <div>
        <HashLoader
   
          color={"#465fff"}
          loading={true}
          cssOverride={override}
          size={size}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
      </div>
      <p className="text-brand-500 dark:text-brand-400 text-md font-medium">{message}</p>
    </div>
  );
}
