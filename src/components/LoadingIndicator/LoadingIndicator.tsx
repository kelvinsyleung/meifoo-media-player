import React from "react";
import "./LoadingIndicator.scss";
import { CSSTransition } from "react-transition-group";
import CircularProgress from "@mui/material/CircularProgress";

interface LoadingIndicatorProps {
    on: boolean;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ on }) => {
    return (
        <CSSTransition
            in={on}
            classNames="loading-indicator"
            timeout={200}
            mountOnEnter
            unmountOnExit
        >
            <div className="loading-indicator">
                <CircularProgress color="primary" />
            </div>
        </CSSTransition>
    );
};

export default LoadingIndicator;
