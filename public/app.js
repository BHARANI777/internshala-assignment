const socket = io();

// Your client-side logic goes here
$(document).ready(() => {
  const $messageList = $('#message-list');
  const $messageInput = $('#message-input');
  const $sendButton = $('#send-button');

  // Emit typing event
  $messageInput.on('input', () => {
    socket.emit('typing');
  });

  // Emit stopTyping event
  $messageInput.on('blur', () => {
    socket.emit('stopTyping');
  });

  // Handle typing event
  socket.on('typing', (data) => {
    $messageList.append(`<li><em>${data.username} is typing...</em></li>`);
    scrollToBottom();
  });

  // Handle stopTyping event
  socket.on('stopTyping', (data) => {
    $messageList.append(`<li><em>${data.username} stopped typing.</em></li>`);
    scrollToBottom();
  });

  // Handle message event
  socket.on('message', (data) => {
    $messageList.append(`<li><strong>${data.username}:</strong> ${data.message}</li>`);
    scrollToBottom();
  });

  // Send message on button click
  $sendButton.on('click', () => {
    const message = $messageInput.val().trim();
    if (message !== '') {
      socket.emit('message', message);
      $messageInput.val('');
    }
  });

  // Helper function to scroll to the bottom of the message list
  function scrollToBottom() {
    $messageList.scrollTop($messageList[0].scrollHeight);
  }
});
