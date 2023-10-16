import { Badge } from "@material-ui/core";
import NotificationsOutlinedIcon from "@material-ui/icons/NotificationsOutlined";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { Nav, Navbar, NavDropdown } from "react-bootstrap";
import { useNavigate, useLocation, Link } from "react-router-dom";
import NotificationBLock from "../NotificationBlock/NotificationBlock";
import { getCookieValue, removeSingleCookie, setCookies } from "./../../../cookieHelper";
import "./Header.scss";
import Moment from "moment-timezone";
import { languageList } from "../../../i18n/locales";
import translate from "../../../i18n/translate";
import Loader from "../Loader/Loader";
import { useSelector, useDispatch } from "react-redux";
import { useIntl } from "react-intl";
import { soloProducts, allEnglishProductIds } from "./../../../globalConstants";
import allActions from "../../../redux/actions";
import { twtLicenseMappingCheck } from "../../../helpers/twtHelpers";
import { twtLicenseMapper } from "../../../globalConstants";

const HeaderComponent = (props: any) => {
  const navigate = useNavigate();
  const intl = useIntl();
  const allInfo = useSelector((state: any) => state);
  const dispatch = useDispatch();
  let location = useLocation();
  const [mobilewidth, setmobilewidth] = useState(false);
  const [selectedMenuItem, setselectedMenuItem] = useState("");
  const [isnewsfeedfeatureenabled, setisnewsfeedfeatureenabled] = useState(false);
  const [isTwtfeatureenabled, setisTwtfeatureenabled] = useState(false);
  const [isStressAndIntonationEnabled, setIsStressAndIntonationEnabled] = useState(false);
  const [industryFeedEnabled, setIndustryFeedEnabled] = useState(false);
  const [isCultureCentreEnabled, setisCultureCentreEnabled] = useState(false);
  const [width, setWidth] = useState(0);
  const [orglogoAvailable, setorglogoAvailable] = useState(false);
  const [subHeaderToRender, setsubHeaderToRender] = useState<any>(false);
  let [isWelcomePage, setisWelcomePage] = useState(false);
  let [isIntercept, setIsIntercept] = useState(false);
  const [isTwtUnlimitedEnabled, setIsTwtUnlimitedEnabled] = useState(false);
  const [isfeatureenabled, setisfeatureenabled] = useState(false);
  const [showCount, setShowCount] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  let [navExpanded, setNavExpanded] = useState(false);
  const [isWebshopEnabled, setWebshopEnabled] = useState(false);
  let timeZone = Moment.tz.guess(true);
  const [isOneUser, setIsOneUser] = useState<boolean | null>(null);
  const [ssoEnabled, setSsoEnabled] = useState(false);

  const handleToggle = (displayNotification: boolean, displayCount: boolean, length: number) => {
    setShowNotification(displayNotification);
    setNotificationCount(length);
    setShowCount(displayCount);
  };

  const navigateToPage = (pageName: string) => {
    const uId = allInfo.peopleInformation.data.getpeopleInformation.edgeUid;
    if(!allInfo.welcomeFlowApi.data){
      let cookieNameForSimplified = "cameFrom";
      let cookieValueForSimplified = "lsm";
      let domain = JSON.parse(process.env.REACT_APP_COOKIE_DOMAINS || "[]") || [];
      let finalCookie = cookieNameForSimplified+"="+cookieValueForSimplified+";domain="+domain[0];
      document.cookie = finalCookie;
        dispatch(allActions.welcomeFlowRegUpdateAction.welcomeFlowRegUpdate(uId));
    }
    
    navigate(`/${pageName}`);
  };

  const afterGetLearnerInfo = (resp: any) => {
    if (resp && resp.data) {
      if (!!!getCookieValue("orgLogoPath")) {
        setCookies(`orgLogoPath`, resp.data.getpeopleInformation.orgLogoPath);
      }
      let includedIds = JSON.parse(process.env.REACT_APP_BLENDED_USERS || "") || [{}];
      const filteredArray = resp.data.getpeopleInformation.license.filter((product: any) => {
        return includedIds.indexOf(parseInt(product["productId"])) > -1 && product["active"] == 1;
      });
      filteredArray.length > 0
        ? sessionStorage.setItem("isScheduleRequired", "true")
        : sessionStorage.setItem("isScheduleRequired", "false");

      if (resp.data.getpeopleInformation.serviceConfiguration.features.substring(6, 7) === "1") {
        setisfeatureenabled(true);
      }
      if (resp.data.getpeopleInformation.serviceConfiguration.features.substring(46, 47) === "1") {
        setisnewsfeedfeatureenabled(true);
      }
      if (resp.data.getpeopleInformation.serviceConfiguration.features.substring(12, 13) === "1") {
        setWebshopEnabled(true);
      }

      if (resp.data.getpeopleInformation.serviceConfiguration.features.substring(11, 12) === "1") {
        setisTwtfeatureenabled(true);
      }
      if (resp.data.getpeopleInformation.serviceConfiguration.features.substring(27, 28) === "1") {
        setisCultureCentreEnabled(true);
      }

      if (resp.data.getpeopleInformation.serviceConfiguration.features.substring(53, 54) === "1") {
        setIsStressAndIntonationEnabled(true);
      }
      if (resp.data.getpeopleInformation.serviceConfiguration.features.substring(47, 48) === "1") {
        setIndustryFeedEnabled(true);
      }
      if (resp.data.getpeopleInformation.serviceConfiguration.features.substring(80, 81) === "1") {
        setIsTwtUnlimitedEnabled(true);
      }

      if (
        resp.data.getpeopleInformation.serviceConfiguration.features.substring(2, 3) !== "1" ||
        !!sessionStorage.getItem("isDemoUser")
      ) {
        var elem = document.querySelector(".live-agent-container");
        if (!!elem) elem.remove();
      }
    }
  };

  const handleCookiePolicyClose = () => {
    setCookies(`${process.env.REACT_APP_COOKIE_POLICY}`, 1);
  };

  function checkForIntercept() {
    if ((location.pathname !== "/welcome" && !!!allInfo.common.managerEmail && !!allInfo.common.isManagerEmailRequired) ||
        (sessionStorage.getItem("RenwalIntercept") === "true" && allInfo.common.isRenewalInterceptRequired) ||
        (props.isInterceptEnabled || location.pathname === "/intercept") ||
        (!localStorage.getItem("cultureCenterSelected") && props.cultureCenterIntercept)) { 
          setIsIntercept(true); 
        } else { 
            setIsIntercept(false); 
        }
    }
    
  useEffect(() => {
    setselectedMenuItem(getBaseName());
    if (location.pathname === "/welcome") {
      setisWelcomePage(true);
    } else {
      setisWelcomePage(false);
    }
    checkForIntercept();
  }, [window.location.href, location.pathname]);

  useEffect(() => {
    if (!!!allInfo.peopleInformation.isLoading && !!!allInfo.statesList.isLoading) {
      if(allInfo.peopleInformation.data) {
        if ((allInfo.peopleInformation.data.getpeopleInformation.serviceConfiguration.features.substring(39, 40)) === "0") {
          setSsoEnabled(true);
        }
      }      
    }
  }, [allInfo.peopleInformation]);

  useEffect(() => {
    if (!!!allInfo.common.isLoading) {
      getButtonView();
      if (!!allInfo.common.isUserAuthenticated) {
        handleCookiePolicyClose();
      }
    }
  }, [allInfo.common]);

  useEffect(() => {
    if (
      !!!allInfo.common.isLoading &&
      !!!allInfo.peopleInformation.isLoading &&
      !!!allInfo.learnerTasks.isLoading &&
      !!!allInfo.jwkPublicKey.isLoading
    ) {
      if (!allInfo.peopleInformation.isFailed && !!allInfo.peopleInformation.data) {
        afterGetLearnerInfo(allInfo.peopleInformation);
      }
    }
    if (
      allInfo.peopleInformation &&
      allInfo.peopleInformation.data &&
      allInfo.peopleInformation.data.getpeopleInformation &&
      allInfo.peopleInformation.data.getpeopleInformation &&
      process.env.REACT_APP_ENVIRONMENT !== "prod"
    ) {
      const license = allInfo.peopleInformation.data.getpeopleInformation.license;
      if (typeof license === "object" && license.length > 0) {
        const isProductOne = license.findIndex((eachObject: any) => eachObject.productId === "1");
        if (isProductOne !== -1) {
          setIsOneUser(true);
        } else {
          setIsOneUser(false);
        }
      }
    } else if (process.env.REACT_APP_ENVIRONMENT === "prod") {
      setIsOneUser(false);
    }
  }, [allInfo.common, allInfo.peopleInformation, allInfo.learnerTasks, allInfo.jwkPublicKey]);

  useEffect(() => {
    if (location.pathname === "/welcome") {
      setisWelcomePage(true);
    } else {
      setisWelcomePage(false);
    }
    checkForIntercept();
  }, []);

  useEffect(() => {
    if (showNotification && !showCount) {
      sessionStorage.setItem("notificationPopup", "true");
    } else if (!showNotification && !showCount) {
      sessionStorage.setItem("notificationPopup", "false");
    }
  });

  useEffect(() => {
    getButtonView();
  }, [isfeatureenabled]);

  useEffect(() => {
    checkForIntercept();
  }, [props.isRenewal]);

  useEffect(() => {
    setShowCount(showCount);
    setNotificationCount(notificationCount);
    setShowNotification(showNotification);
    getButtonView();
  }, [showNotification, showCount, notificationCount]);

  useEffect(() => {
    checkForIntercept();
  }, [
    allInfo.common.managerEmail,
    allInfo.common.isManagerEmailRequired,
    sessionStorage.getItem("RenwalIntercept"),
    allInfo.common.renewalintercept,
    allInfo.common.isRenewalInterceptRequired,
  ]);

  useLayoutEffect(() => {
    function updateSize() {
      setWidth(window.innerWidth);
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    if (width <= 991) {
      setmobilewidth(true);
    } else {
      setmobilewidth(false);
    }
  });

  const capitalize = (s: any) => {
    if (typeof s !== "string") return "";
    s = s.toLowerCase();
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const handleSelect = (eventKey: any) => {
    setselectedMenuItem(eventKey);
  };

  const Togglestate = () => {
    const isShow: boolean = showNotification;
    handleToggle(!isShow, false, 0);
  };

  const getButtonView = () => {
    if (!!allInfo.common && !!allInfo.common.isUserAuthenticated) {
      setorglogoAvailable(true);
      setsubHeaderToRender(true);
    } else {
      setorglogoAvailable(false);
      setsubHeaderToRender(false);
    }
  };

  const logout = () => {
    const uId = sessionStorage.getItem('leuId');
    if(uId){
      dispatch(allActions.tosSessionInfoAction.getTosSessionInfo(uId, "6"))
    }
    removeSingleCookie(`${process.env.REACT_APP_ENV}IdToken`)
    navigate('/logout');
    getButtonView();
  };

  const getBaseName = () => {
    let url = window.location.href;
    let splitUrl = url.split("/");
    return splitUrl[3].toString();
  };

  const setNavExpandedMenu = (expanded: boolean) => {
    setNavExpanded(expanded);
  };

  const closeNav = (e: any) => {
    e.target.classList.remove("active");
    setNavExpanded(false);
  };

  useEffect(() => {
    if (
      !!!allInfo.common.isLoading &&
      !!!allInfo.common.data &&
      !!!allInfo.peopleInformation.isLoading &&
      allInfo.peopleInformation.data &&
      isTwtfeatureenabled
    ) {
      if (allInfo.getLearnerDetails.data) {
        dispatch(allActions.getTWTSessionsAction.getTWTSessions());
      } else {
        if (allInfo.peopleInformation.data["getpeopleInformation"]) {
          let productDetails = allInfo.peopleInformation.data.getpeopleInformation.license.find(
            (x: any) => allEnglishProductIds.includes(x.productId) || soloProducts.includes(x.productId) || x.productId === "5"
          );
          dispatch(
            allActions.getLearnerDetailsAction.getLearnerDetails(allInfo.common.leuId, productDetails.productId)
          );
        }
      }

      if (!!!allInfo.twtUserTrackHistory.data && !!!allInfo.twtUserTrackHistory.isLoading && !isTwtUnlimitedEnabled) {
        dispatch(allActions.twtUnlimitedActions.twtUserTrackHistory(allInfo.common.leuId));
      }
    }
  }, [allInfo.common, allInfo.peopleInformation, allInfo.getLearnerDetails]);

  useEffect(() => {
    if (
      !!!allInfo.getTWTSessions.isLoading &&
      !!!allInfo.getTWTSessions.isFailed &&
      !!allInfo.getTWTSessions.data &&
      !!!allInfo.getLearnerDetails.isLoading &&
      allInfo.announcements.data
    ) {
      if (!!allInfo.twtUserTrackHistory.data && allInfo.twtUserTrackHistory.data) {
        getSessionsForTheDay();
        const interval = setInterval(() => {
          getSessionsForTheDay();
        }, 30000);
        return () => {
          clearInterval(interval);
        };
      }
    }
  }, [allInfo.getTWTSessions, allInfo.twtUserTrackHistory]);

  const getSessionsForTheDay = () => {
    let currentTime = Moment().tz(timeZone).valueOf();
    let twtLicenseMapperCheck = twtLicenseMappingCheck(
      allInfo.peopleInformation.data.getpeopleInformation.license,
      twtLicenseMapper
    );
    if (
      allInfo.getLearnerDetails.data.getLearnerInfo &&
      allInfo.peopleInformation.data.getpeopleInformation &&
      twtLicenseMapperCheck.length > 0
    ) {
      let userLevel = allInfo.getLearnerDetails.data.getLearnerInfo.Level;
      const filteredSessions = allInfo.getTWTSessions.data.filter((session: any) => {
        let timeToDisplay = Moment(session.startTime).tz(timeZone).add(10, "minutes").valueOf();
        let matchLevel = session?.classType.levelIds.find((x: any) => (x.cefr === userLevel ? true : false));
        if (
          twtLicenseMapperCheck[0].language === session?.classType.language.languageCode &&
          matchLevel &&
          currentTime < timeToDisplay
        ) {
          let enableJoinNowTime = Moment(session.startTime).tz(timeZone).valueOf();
          let showCardTime = Moment(session.startTime).tz(timeZone).add(10, "minutes").valueOf();
          if (showCardTime > currentTime && currentTime > enableJoinNowTime) {
            return session;
          }
        }
      });

      let getSession = sessionStorage.getItem("twtNotification");
      if (filteredSessions.length > 0) {
        if (getSession && getSession !== filteredSessions[0].id) {
          sessionStorage.setItem("twtNotification", filteredSessions[0].id);
          dispatch(allActions.announcementsAction.getTWTNotifications(true));
          setShowNotification(true);
        } else {
          if (!getSession) {
            setShowNotification(true);
            sessionStorage.setItem("twtNotification", filteredSessions[0].id);
          }
          dispatch(allActions.announcementsAction.getTWTNotifications(true));
        }
      } else {
        if (allInfo.announcements.data && allInfo.announcements.data.twtNotification) {
          setShowNotification(false);
          dispatch(allActions.announcementsAction.getTWTNotifications(false));
        }
      }
    }
  };

  return (
    <header className="Header">
      <Loader showLoader={false} />
      <div className="main_Header">
        <Navbar
          className={`${mobilewidth ? "mobile_header" : "desktop_header"} HeaderContainer`}
          expand="lg"
          onToggle={setNavExpandedMenu}
          expanded={navExpanded}
        >
          <Navbar.Brand
            onClick={(e: any) => {
              e.preventDefault();
              setselectedMenuItem("");
              navigateToPage("");
              closeNav(e);
            }}
          >
            {mobilewidth ? (
              <React.Fragment>
                {orglogoAvailable ? (
                  <img
                    className="mobilelogo"
                    src={window.location.origin + "/images/logos/Halo-White-logo.svg"}
                    alt="Halo logo mobile"
                    title="Halo mobile"
                  />
                ) : (
                  <img
                    className="mobilelogo"
                    src={window.location.origin + "/images/logos/Learnship-Halo-white-logo.svg"}
                    alt="Learnship Halo logo mobile"
                    title="Learnship Halo mobile"
                  />
                )}
              </React.Fragment>
            ) : (
              <React.Fragment>
                {orglogoAvailable ? (
                  <img
                    className="normallogo logged_in_logo"
                    src={window.location.origin + "/images/logos/Halo-White-logo.svg"}
                    alt="Halo logo"
                    title="Halo"
                  />
                ) : (
                  <img
                    className="normallogo"
                    src={window.location.origin + "/images/logos/Learnship-Halo-white-logo.svg"}
                    alt="Learnship Halo logo"
                    title="Learnship Halo"
                  />
                )}
              </React.Fragment>
            )}
          </Navbar.Brand>
          {orglogoAvailable && !isWelcomePage && mobilewidth && !isIntercept && (
            <React.Fragment>
              <Nav.Link
                onClick={(e: any) => {
                  Togglestate();
                  closeNav(e);
                }}
                className="notification mobile_notification"
              >
                <Badge
                  aria-label={`${intl.formatMessage({ id: "notification" })} ${notificationCount}`}
                  badgeContent={notificationCount > 0 ? notificationCount : 0}
                  color="primary"
                  className="noti_badge"
                >
                  <NotificationsOutlinedIcon />
                </Badge>
              </Nav.Link>
              {orglogoAvailable && getCookieValue("orgLogoPath") && (
                <span className="compony-logo mobile_logo">
                  <img
                    alt="learner's company logo"
                    src={unescape(
                      getCookieValue("orgLogoPath") || window.location.origin + "/images/logos/LS-mobile-blacklogo.png"
                    )}
                  />
                </span>
              )}
            </React.Fragment>
          )}
          <Navbar.Toggle aria-controls="basic-navbar-nav" aria-expanded={navExpanded} />
          <Navbar.Collapse id="basic-navbar-nav" aria-controls="basic-navbar-nav">
            <Nav className={`${orglogoAvailable ? "logged_in_dropdowns" : "login_dropdowns"} mr-auto`}>
              {orglogoAvailable && mobilewidth && (
                <div className="menu-uname-block">
                  <b>
                    {!!allInfo.peopleInformation.data && allInfo.peopleInformation.data.getpeopleInformation.username}
                  </b>
                  <div className="menu-email-block">
                    {!!allInfo.peopleInformation.data && allInfo.peopleInformation.data.getpeopleInformation.email}
                  </div>
                </div>
              )}

              <NavDropdown
                className="language_dropdown"
                title={
                  <React.Fragment>
                    {languageList.filter((lang: any) => {
                      return lang.locale.indexOf(props.currentLang) !== -1 && lang.isVisible;
                    }).length > 0
                      ? languageList.filter((lang: any) => lang.locale === props.currentLang)[0].name
                      : languageList.filter((lang: any) => lang.locale === "EN")[0].name}
                    <KeyboardArrowDownIcon className="drop_arrow_icon" />
                  </React.Fragment>
                }
                id="basic-nav-dropdown-lang"
              >
                <div>
                  {languageList.map(
                    (item: any) =>
                      item.locale !== props.currentLang &&
                      item.isVisible && (
                        <NavDropdown.Item
                          key={item.locale}
                          onClick={(e: any) => {
                            props.lChange(item.locale);
                            closeNav(e);
                          }}
                        >
                          {capitalize(item.name)}
                        </NavDropdown.Item>
                      )
                  )}
                </div>
              </NavDropdown>
              <NavDropdown
                className="help_dropdown"
                title={
                  <React.Fragment>
                    {translate("help")} <KeyboardArrowDownIcon className="drop_arrow_icon" />
                  </React.Fragment>
                }
                id="basic-nav-dropdown-support"
              >
                <NavDropdown.Item
                  target="_blank"
                  onClick={(e: any) => {
                    closeNav(e);
                  }}
                  href={`${process.env["REACT_APP_GE_SUPPORT_URL"]}/${
                    getCookieValue("ulang") === "EN" ? "en-en" : (getCookieValue("ulang") || "").toLowerCase()
                  }`}
                  id="frequently_asked"
                >
                  {translate("frequently_asked_ques")}
                </NavDropdown.Item>
                <NavDropdown.Item
                  target="_blank"
                  onClick={(e: any) => {
                    closeNav(e);
                  }}
                  href={`${process.env["REACT_APP_GE_SUPPORT_URL"]}/${
                    getCookieValue("ulang") === "EN" ? "en-en" : (getCookieValue("ulang") || "").toLowerCase()
                  }/contact_support`}
                  id="contact-support"
                >
                  {translate("customer_support")}
                </NavDropdown.Item>
              </NavDropdown>
              {orglogoAvailable && !mobilewidth && (
                <React.Fragment>
                  {!isWelcomePage && !isIntercept && (
                    <Nav.Link
                      onClick={(e: any) => {
                        Togglestate();
                        closeNav(e);
                      }}
                      className="notification"
                    >
                      <Badge
                        aria-label={`${intl.formatMessage({ id: "notification" })} ${notificationCount}`}
                        badgeContent={notificationCount > 0 ? notificationCount : 0}
                        color="primary"
                        className="noti_badge"
                      >
                        <NotificationsOutlinedIcon />
                      </Badge>
                    </Nav.Link>
                  )}
                  {orglogoAvailable && getCookieValue("orgLogoPath") && (
                    <span className="compony-logo">
                      <img
                        alt="Halo logo mobile"
                        src={unescape(
                          getCookieValue("orgLogoPath") ||
                            window.location.origin + "/images/logos/LS-mobile-blacklogo.png"
                        )}
                      />
                    </span>
                  )}
                  <NavDropdown
                    title={
                      <React.Fragment>
                        {!!allInfo.peopleInformation.data &&
                          allInfo.peopleInformation.data.getpeopleInformation.firstName}{" "}
                        <KeyboardArrowDownIcon className="drop_arrow_icon" />
                      </React.Fragment>
                    }
                    id="basic-nav-dropdown"
                    className="burger-menu"
                  >
                    <div className="menu-uname-block">
                      <b>
                        {!!allInfo.peopleInformation.data &&
                          allInfo.peopleInformation.data.getpeopleInformation.username}
                      </b>
                      <div className="menu-email-block">
                        {!!allInfo.peopleInformation.data && allInfo.peopleInformation.data.getpeopleInformation.email}
                      </div>
                    </div>
                    <NavDropdown.Divider />
                    {!isWelcomePage && isfeatureenabled && !isIntercept && !sessionStorage.getItem("isDemoUser") && (
                      <NavDropdown.Item
                        onClick={(e: any) => {
                          e.preventDefault();
                          closeNav(e);
                          navigateToPage("profile");
                          setselectedMenuItem("");
                        }}
                        href="/profile"
                        id="profile"
                      >
                        {translate("profile_title")}
                      </NavDropdown.Item>
                    )}
                    {!ssoEnabled ? <NavDropdown.Item
                      className="logout_btn"
                      onClick={(e: any) => {
                        closeNav(e);
                        logout();
                      }}
                    >
                     <span>{translate("log_out")}</span>
                    </NavDropdown.Item> : <></>}
                    
                  </NavDropdown>
                </React.Fragment>
              )}
              {orglogoAvailable && mobilewidth && (
                <React.Fragment>
                  {!isWelcomePage && !isIntercept && !sessionStorage.getItem("isDemoUser") && (
                    <Nav.Link
                      onClick={(e: any) => {
                        e.preventDefault();
                        closeNav(e);
                        navigateToPage("profile");
                        setselectedMenuItem("");
                      }}
                      href="/profile"
                    >
                      {translate("profile_title")}
                    </Nav.Link>
                  )}
                  {!ssoEnabled ? <Nav.Link
                    className="logout_btn"
                    onClick={(e: any) => {
                      closeNav(e);
                      logout();
                    }}
                  >
                     <span>{translate("log_out")}</span>
                  </Nav.Link> : <></>}
                  
                </React.Fragment>
              )}
            </Nav>
          </Navbar.Collapse>
        </Navbar>
      </div>

      {orglogoAvailable && !isWelcomePage && !isIntercept && (
        <div className="NotificationWrapper">
          <NotificationBLock showNotification={showNotification} handleToggle={handleToggle}></NotificationBLock>
        </div>
      )}

      {subHeaderToRender && !isWelcomePage && !isIntercept && (
        <div className="sub_Header">
          <Nav variant="pills" onSelect={handleSelect}>
            {sessionStorage.getItem("isScheduleRequired") === "true" && (
              <Nav.Item
                onClick={(e: any) => {
                  e.preventDefault();
                  navigateToPage("schedule");
                }}
              >
                <Nav.Link
                  eventKey="schedule"
                  className={selectedMenuItem === "schedule" ? "activeItem" : ""}
                  href="/schedule"
                >
                  {translate("myschedule_schedule")}
                </Nav.Link>
              </Nav.Item>
            )}
            <Nav.Item
              onClick={(e: any) => {
                e.preventDefault();
                navigateToPage("progress");
              }}
            >
              <Nav.Link
                eventKey="progress"
                className={selectedMenuItem === "progress" ? "activeItem" : ""}
                href="/progress"
              >
                {translate("feature_progress")}
              </Nav.Link>
            </Nav.Item>

            <NavDropdown
              title={
                <React.Fragment>
                  {translate("title_feature")} <KeyboardArrowDownIcon className="drop_arrow_icon" />
                </React.Fragment>
              }
              id="nav-dropdown"
              className={
                selectedMenuItem === "culturecenter" ||
                selectedMenuItem === "emailtemplates" ||
                selectedMenuItem === "accentsanddialects"
                  ? "activeItem"
                  : ""
              }
            >
              <React.Fragment>
                {isCultureCentreEnabled && (
                  <NavDropdown.Item
                    eventKey="culturecenter"
                    href="/culturecenter"
                    onClick={(e: any) => {
                      e.preventDefault();
                      closeNav(e);
                      navigateToPage("culturecenter");
                    }}
                    id="culturecenter"
                  >
                    {translate("feature_culture_centre_title")}
                  </NavDropdown.Item>
                )}

                <NavDropdown.Item
                  eventKey="emailtemplates"
                  href="/emailtemplates"
                  onClick={(e: any) => {
                    e.preventDefault();
                    closeNav(e);
                    navigateToPage("emailtemplates");
                  }}
                  id="emailtemplates"
                >
                  {translate("feature_emailTemplates_title")}
                </NavDropdown.Item>

                {isTwtfeatureenabled && (
                  <NavDropdown.Item
                    eventKey="twt"
                    href="/twt"
                    onClick={(e: any) => {
                      e.preventDefault();
                      closeNav(e);
                      navigateToPage("twt");
                    }}
                    id="twt"
                  >
                    {translate("feature_talkWithTeacher_title")}
                  </NavDropdown.Item>
                )}

                <NavDropdown.Item
                  eventKey="accentsanddialects"
                  href="/accentsanddialects"
                  onClick={(e: any) => {
                    e.preventDefault();
                    closeNav(e);
                    navigateToPage("accentsanddialects");
                  }}
                  id="accentsanddialects"
                >
                  {translate("accentsAndDialects_heading")}
                </NavDropdown.Item>
       
                    <NavDropdown.Item
                      eventKey="vocabularyCenter"
                      href="/vocabularycenter"
                      onClick={(e: any) => {
                        e.preventDefault();
                        closeNav(e);
                        navigateToPage("vocabularycenter");
                      }}
                      id="vocabularyCenter"
                    >
                      {translate("vocab_center_product_headline")}
                    </NavDropdown.Item>
                    {!!!sessionStorage.getItem("isDemoUser") && isOneUser && isOneUser !== null && (
                    <React.Fragment>
                    {isStressAndIntonationEnabled && (
                      <NavDropdown.Item
                        eventKey="stressAndIntonation"
                        href="/stressandintonation"
                        onClick={(e: any) => {
                          e.preventDefault();
                          closeNav(e);
                          navigateToPage("stressandintonation");
                        }}
                        id="stressAndIntonation"
                      >
                        {translate("stress_intonation_product_headline")}
                      </NavDropdown.Item>
                    )}
                    {isStressAndIntonationEnabled && (
                      <NavDropdown.Item
                        eventKey="soundsofenglish"
                        href="/soundsofenglish"
                        onClick={(e: any) => {
                          e.preventDefault();
                          closeNav(e);
                          navigateToPage("soundsofenglish");
                        }}
                        id="soundsofenglish"
                      >
                        {translate("soe_product_headline")}
                      </NavDropdown.Item>
                    )}
                    <NavDropdown.Item
                      eventKey="writingCenter"
                      href="/writingcenter"
                      onClick={(e: any) => {
                        e.preventDefault();
                        closeNav(e);
                        navigateToPage("writingcenter");
                      }}
                      id="writingCenter"
                    >
                      Writing center
                    </NavDropdown.Item>
                    <NavDropdown.Item
                      eventKey="globalCommunityTutorials"
                      href="/globalcommunitytutorials"
                      onClick={(e: any) => {
                        e.preventDefault();
                        closeNav(e);
                        navigateToPage("globalcommunitytutorials");
                      }}
                      id="globalCommunityTutorials"
                    >
                      Global community tutorials
                    </NavDropdown.Item>
                  </React.Fragment>
                )}
                {/* industryFeedEnabled && (
                <NavDropdown.Item
                  eventKey="industryFeed"
                  href="/industryfeed"
                  onClick={(e: any) => {
                    e.preventDefault();
                    closeNav(e);
                    navigateToPage("industryfeed");
                  }}
                >
                  <Link to="/industryfeed">Industry feed</Link>
                </NavDropdown.Item>
              ) */}
              </React.Fragment>
              {isnewsfeedfeatureenabled && !!!allInfo.common.isNewsfeedTzBlocked && (
                <NavDropdown.Item
                  target="_blank"
                  onClick={(e: any) => {
                    closeNav(e);
                  }}
                  href={process.env["REACT_APP_NEWSFEEDREDIRECTURL"] || "/"}
                  id="newsfeed"
                >
                  {translate("feature_newsfeed_title")}
                </NavDropdown.Item>
              )}
            </NavDropdown>
          </Nav>
        </div>
      )}
    </header>
  );
};

export default HeaderComponent;
