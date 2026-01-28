"use client";

import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { AlertCircle, CheckCircle, Info, DollarSign, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationItemProps {
    notification: any;
    onMarkAsRead: (id: string) => void;
}

const iconMap = {
    PAYMENT_PENDING: AlertCircle,
    PAYMENT_RECEIVED: CheckCircle,
    MONTHLY_DUE: DollarSign,
    SYSTEM: Info,
    ALERT: Bell,
};

const colorMap = {
    PAYMENT_PENDING: "text-red-500",
    PAYMENT_RECEIVED: "text-green-500",
    MONTHLY_DUE: "text-yellow-500",
    SYSTEM: "text-blue-500",
    ALERT: "text-orange-500",
};

const bgMap = {
    PAYMENT_PENDING: "bg-red-500/10",
    PAYMENT_RECEIVED: "bg-green-500/10",
    MONTHLY_DUE: "bg-yellow-500/10",
    SYSTEM: "bg-blue-500/10",
    ALERT: "bg-orange-500/10",
};

export function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
    const Icon = iconMap[notification.type as keyof typeof iconMap] || Info;
    const iconColor = colorMap[notification.type as keyof typeof colorMap] || "text-gray-500";
    const bgColor = bgMap[notification.type as keyof typeof bgMap] || "bg-gray-500/10";

    const handleClick = () => {
        if (!notification.isRead) {
            onMarkAsRead(notification.id);
        }
    };

    return (
        <div
            onClick={handleClick}
            className={cn(
                "p-4 hover:bg-muted/50 cursor-pointer transition-colors",
                !notification.isRead && "bg-blue-50 dark:bg-blue-950/20"
            )}
        >
            <div className="flex gap-3">
                <div className={cn("rounded-full p-2 h-10 w-10 flex items-center justify-center flex-shrink-0", bgColor)}>
                    <Icon className={cn("h-5 w-5", iconColor)} />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <h4 className={cn(
                            "font-medium text-sm",
                            !notification.isRead && "font-semibold"
                        )}>
                            {notification.title}
                        </h4>
                        {!notification.isRead && (
                            <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />
                        )}
                    </div>

                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                    </p>

                    {notification.student && (
                        <p className="text-xs text-muted-foreground mt-1">
                            {notification.student.firstName} {notification.student.lastName}
                        </p>
                    )}

                    <p className="text-xs text-muted-foreground mt-2">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                            locale: es,
                        })}
                    </p>
                </div>
            </div>
        </div>
    );
}
