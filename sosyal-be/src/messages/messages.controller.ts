import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Patch,
  Delete,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  async createMessage(
    @Body() body: {
      receiverId: string;
      content: string;
      type?: string;
      fileUrl?: string;
      fileName?: string;
      fileSize?: number;
    },
    @Request() req,
  ) {
    try {
      console.log('Creating message:', { senderId: req.user.id, ...body });
      const result = await this.messagesService.createMessage(
        req.user.id,
        body.receiverId,
        body.content,
        body.type,
        body.fileUrl,
        body.fileName,
        body.fileSize,
      );
      console.log('Message created successfully:', result);
      return result;
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
  }

  @Get('conversations')
  async getUserConversations(@Request() req) {
    return this.messagesService.getUserConversations(req.user.id);
  }

  @Get('conversations/by-participants')
  async getConversationByParticipants(
    @Query('participants') participants: string,
    @Request() req,
  ) {
    try {
      console.log('Getting conversation by participants:', { participants, userId: req.user.id });
      const participantIds = participants.split(',');
      const result = await this.messagesService.getConversationByParticipants(participantIds, req.user.id);
      console.log('Conversation found:', result);
      return result;
    } catch (error) {
      console.error('Error getting conversation by participants:', error);
      throw error;
    }
  }

  @Get('conversations/:conversationId')
  async getConversationMessages(
    @Param('conversationId') conversationId: string,
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0,
  ) {
    return this.messagesService.getConversationMessages(conversationId, limit, offset);
  }

  @Patch(':messageId/read')
  async markMessageAsRead(
    @Param('messageId') messageId: string,
    @Request() req,
  ) {
    await this.messagesService.markMessageAsRead(messageId, req.user.id);
    return { message: 'Message marked as read' };
  }

  @Patch('conversations/:conversationId/read')
  async markConversationAsRead(
    @Param('conversationId') conversationId: string,
    @Request() req,
  ) {
    await this.messagesService.markConversationAsRead(conversationId, req.user.id);
    return { message: 'Conversation marked as read' };
  }

  @Delete(':messageId')
  async deleteMessage(
    @Param('messageId') messageId: string,
    @Request() req,
  ) {
    await this.messagesService.deleteMessage(messageId, req.user.id);
    return { message: 'Message deleted' };
  }

  @Patch(':messageId')
  async editMessage(
    @Param('messageId') messageId: string,
    @Body('content') content: string,
    @Request() req,
  ) {
    return this.messagesService.editMessage(messageId, req.user.id, content);
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req) {
    const count = await this.messagesService.getUnreadCount(req.user.id);
    return { unreadCount: count };
  }
}
