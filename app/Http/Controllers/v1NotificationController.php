<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class v1NotificationController extends Controller
{
    public function check(Request $request): JsonResponse
    {
        $user = $request->user("sanctum");

        if (!$user) {
            return response()->json([
                "notifications" => [],
                "unread_count" => 0,
            ], 401);
        }

        $notifications = Notification::forUser($user);
        $unread_count = Notification::unreadCount($user);

        return response()->json([
            "notifications" => $notifications,
            "unread_count" => $unread_count,
        ]);
    }

    // PATCH /api/v1/notifications/read/{id}
    public function markRead(Request $request, int $id): JsonResponse
    {
        $user = $request->user("sanctum");

        if (!$user) {
            return response()->json(["message" => "Unauthenticated"], 401);
        }

        $notification = Notification::where("id", $id)
            ->where("user_id", $user->id)
            ->first();

        if (!$notification) {
            return response()->json(["message" => "Notification not found"], 404);
        }

        if (!$notification->read_at) {
            $notification->read_at = now();
            $notification->save();
        }

        return response()->json(["message" => "Notification marked as read", "id" => $notification->id]);
    }

    // PATCH /api/v1/notifications/read-all
    public function markAllRead(Request $request): JsonResponse
    {
        $user = $request->user("sanctum");

        if (!$user) {
            return response()->json(["message" => "Unauthenticated"], 401);
        }

        $updated = Notification::where("user_id", $user->id)
            ->whereNull("read_at")
            ->update(["read_at" => now()]);

        return response()->json(["message" => "All notifications marked as read", "updated" => $updated]);
    }
}
