import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import "./PopupDrawer.scss";
import { CSSTransition } from "react-transition-group";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

interface PopupDrawerProps {
    on: boolean;
    onClose: (on: boolean) => void;
    activePlaybackRate: number;
    onChangePlaybackRate: (playbackRate: number) => void;
    resolutions: shaka.extern.TrackList;
    activeResolutionHeight: number | "auto";
    onChangeResolution: (resolution: shaka.extern.Track | "auto") => void;
}

const PopupDrawer: React.FC<PopupDrawerProps> = ({
    on,
    onClose,
    activePlaybackRate,
    onChangePlaybackRate,
    resolutions,
    activeResolutionHeight,
    onChangeResolution,
}) => {
    const [isMounted, setIsMounted] = useState(false);
    const [isInMainMenu, setIsInMainMenu] = useState(true);
    const [activeType, setActiveType] = useState<"speed" | "resolution">(
        "speed",
    );
    const [DrawerHeight, setDrawerHeight] = useState<"initial" | number>(
        "initial",
    );

    const popupDrawerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!on) return;

        const popup = popupDrawerRef.current!;
        const drawer = popup.firstChild as HTMLElement;

        setDrawerHeight(drawer?.offsetHeight || "initial");
    }, [on]);

    useEffect(() => {
        if (!isMounted) return;

        const outsideClickHandler = (event: MouseEvent) => {
            if (!isMounted || !popupDrawerRef || !popupDrawerRef.current)
                return;
            if (!popupDrawerRef.current.contains(event.target as Node)) {
                onClose(false);
            }
        };

        document.addEventListener("click", outsideClickHandler);

        return () => {
            document.removeEventListener("click", outsideClickHandler);
        };
    }, [isMounted, onClose]);

    const drawerEnteredHandler = () => {
        setIsMounted(true);
    };

    const drawerExitedHandler = () => {
        setIsMounted(false);
        setIsInMainMenu(true);
        setDrawerHeight("initial");
    };

    const calcHeight = (element: HTMLElement) => {
        setDrawerHeight(element.offsetHeight);
    };

    const selectMenuHandler = useCallback((type: "resolution" | "speed") => {
        return () => {
            setIsInMainMenu(false);
            setActiveType(type);
        };
    }, []);

    const selectPlaybackRateHandler = useCallback(
        (playbackRate: number) => {
            return () => {
                setIsInMainMenu(true);
                onChangePlaybackRate(playbackRate);
            };
        },
        [onChangePlaybackRate],
    );

    const matchedResolution = useCallback(
        () =>
            resolutions.find(
                (resolution) => resolution.height === activeResolutionHeight,
            ),
        [activeResolutionHeight, resolutions],
    );

    const selectResolutionHandler = useCallback(
        (resolution: shaka.extern.Track | "auto") => {
            return () => {
                setIsInMainMenu(true);
                onChangeResolution(resolution);
            };
        },
        [onChangeResolution],
    );

    const autoResolutionHeight = useMemo(() => {
        const autoResolution = resolutions.find(
            (resolution) => resolution.active,
        )?.height;

        return autoResolution ? `(${autoResolution}p)` : "";
    }, [resolutions]);

    const mainMenu = useMemo(() => {
        return (
            <div className="popup-drawer-menu">
                <ul className="popup-drawer-list">
                    <li
                        className="popup-drawer-list-item"
                        onClick={selectMenuHandler("speed")}
                    >
                        <span>Speed</span>
                        <span>{activePlaybackRate}x</span>
                    </li>
                    <li
                        className="popup-drawer-list-item"
                        onClick={selectMenuHandler("resolution")}
                    >
                        <span>Resolution</span>
                        <span>
                            {activeResolutionHeight === "auto" ||
                            !matchedResolution
                                ? `Auto ${autoResolutionHeight}`
                                : `${activeResolutionHeight}p`}
                        </span>
                    </li>
                </ul>
            </div>
        );
    }, [
        activePlaybackRate,
        activeResolutionHeight,
        autoResolutionHeight,
        matchedResolution,
        selectMenuHandler,
    ]);

    const playBackRateList = useMemo(() => {
        return (
            <ul>
                {[0.5, 0.75, 1, 1.25, 1.5].map((playbackRate) => (
                    <li
                        key={playbackRate}
                        className={`popup-drawer-list-item${
                            activePlaybackRate === playbackRate ? " active" : ""
                        }`}
                        onClick={selectPlaybackRateHandler(playbackRate)}
                    >
                        {playbackRate}
                    </li>
                ))}
            </ul>
        );
    }, [activePlaybackRate, selectPlaybackRateHandler]);

    const resolutionList = useMemo(() => {
        return (
            <ul>
                <li
                    className={`popup-drawer-list-item${
                        activeResolutionHeight === "auto" ? " active" : ""
                    }`}
                    onClick={selectResolutionHandler("auto")}
                >
                    Auto
                </li>
                {resolutions.map((resolution) => (
                    <li
                        key={resolution.id}
                        className={`popup-drawer-list-item${
                            activeResolutionHeight === resolution.height
                                ? " active"
                                : ""
                        }`}
                        onClick={selectResolutionHandler(resolution)}
                    >
                        {resolution.height}p
                    </li>
                ))}
            </ul>
        );
    }, [activeResolutionHeight, resolutions, selectResolutionHandler]);

    const settingsMenu = (
        <div className="popup-drawer-menu">
            <div
                className="popup-drawer-label"
                onClick={() => setIsInMainMenu(true)}
            >
                <ArrowBackIcon />
                <span>
                    {activeType === "speed" && "Speed"}
                    {activeType === "resolution" && "Resolution"}
                </span>
            </div>
            <ul className="popup-drawer-list">
                {activeType === "speed" && playBackRateList}
                {activeType === "resolution" && resolutionList}
            </ul>
        </div>
    );

    return (
        <CSSTransition
            in={on}
            classNames="popup-drawer"
            timeout={200}
            mountOnEnter
            unmountOnExit
            onEntered={drawerEnteredHandler}
            onExited={drawerExitedHandler}
        >
            <div
                className="popup-drawer"
                ref={popupDrawerRef}
                style={{ height: DrawerHeight }}
            >
                <CSSTransition
                    in={isInMainMenu}
                    classNames="popup-drawer-main-menu"
                    timeout={300}
                    mountOnEnter
                    unmountOnExit
                    onEnter={calcHeight}
                >
                    {mainMenu}
                </CSSTransition>

                <CSSTransition
                    in={!isInMainMenu}
                    classNames="popup-drawer-specific-settings"
                    timeout={300}
                    mountOnEnter
                    unmountOnExit
                    onEnter={calcHeight}
                >
                    {settingsMenu}
                </CSSTransition>
            </div>
        </CSSTransition>
    );
};

export default PopupDrawer;
