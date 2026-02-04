-- Drop the overly permissive INSERT policies
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can insert order items" ON public.order_items;

-- Create more restrictive policies that still allow users to place orders
-- Users can only create orders with their own user_id or matching email
CREATE POLICY "Authenticated users can create their own orders"
ON public.orders FOR INSERT
TO authenticated
WITH CHECK (
    user_id = auth.uid() 
    OR (user_id IS NULL AND customer_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
);

-- Users can only insert items for orders they own
CREATE POLICY "Users can insert items for their own orders"
ON public.order_items FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id = order_id
        AND (o.user_id = auth.uid() OR o.customer_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    )
);