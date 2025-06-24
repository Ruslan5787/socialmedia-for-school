import {Container} from "@chakra-ui/react";
import "./App.css";
import {Navigate, Route, Routes} from "react-router-dom";
import {UserPage} from "./pages/UserPage";
import PostPage from "./pages/PostPage";
import Header from "./components/Header";
import React from "react";
import HomePage from "./pages/HomePage.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import {useRecoilValue} from "recoil";
import userAtom from "./atoms/userAtom.js"
import UpdateProfilePage from "./pages/UpdateProfilePage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import AdministrateGroupsPage from "./pages/AdministrateGroupsPage.jsx";
import SearchUsersPage from "./pages/SearchUsersPage.jsx";
import {SchoolPage} from "./pages/SchoolPage.jsx";
import {StudentsPage} from "./pages/StudentsPage.jsx";
import {GroupUser} from "./pages/GroupUser.jsx";
import {EventPage} from "./components/EventPage.jsx";

function App() {
    const user = useRecoilValue(userAtom);

    return (
        <Container maxW="620px" margin={"0 auto"} textStyle="body">
            <Header/>
            <Routes>
                <Route path="/" element={user ? <HomePage/> : <Navigate to="/auth"/>}/>
                <Route path="/auth" element={!user ? <AuthPage/> : <Navigate to="/"/>}/>
                <Route path="/update" element={user ? <UpdateProfilePage/> : <Navigate to="/"/>}/>
                <Route path="/update/:userId" element={user ? <UpdateProfilePage/> : <Navigate to="/"/>}/>
                <Route path="/searchuser" element={<SearchUsersPage/>}/>
                <Route path="/:username"
                       element={<UserPage/>}/>
                <Route path="/:username/post/:pid" element={<PostPage/>}/>
                <Route path="/chat" element={<ChatPage/>}/>
                <Route path="/chat/:recipientId" element={<ChatPage/>}/>
                <Route path="/chat/room/:roomId" element={<ChatPage/>}/>
                <Route path="/chat/group/:roomId" element={<ChatPage/>}/>
                <Route path="/groups" element={<AdministrateGroupsPage/>}/>
                <Route path="/group" element={<GroupUser/>}/>
                <Route path="/school/:id" element={<SchoolPage/>}/>
                <Route path="/school/students" element={<StudentsPage/>}/>
                <Route path="/events/:eventId" element={<EventPage/>}/>
                <Route path="/event/:eventId" element={<EventPage/>}/>
            </Routes>
        </Container>
    );
}

export default App;
