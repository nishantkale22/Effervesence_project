import React from 'react';
import DepartmentChat from '../DepartmentChat';

const ChatTab = ({ user }) => {
    if (!user) return <div>Loading chat...</div>;
    return <DepartmentChat department={user.department} user={user} />;
};

export default ChatTab;
