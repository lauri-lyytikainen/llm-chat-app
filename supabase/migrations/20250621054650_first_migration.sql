-- Create chats table
create table chats (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create messages table
create table messages (
  id uuid default gen_random_uuid() primary key,
  chat_id uuid references chats(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies
alter table chats enable row level security;
alter table messages enable row level security;

create policy "Users can view their own chats"
  on chats for select
  using (auth.uid() = user_id);

create policy "Users can insert their own chats"
  on chats for insert
  with check (auth.uid() = user_id);

create policy "Users can view messages in their chats"
  on messages for select
  using (exists (
    select 1 from chats
    where chats.id = messages.chat_id
    and chats.user_id = auth.uid()
  ));

create policy "Users can insert messages in their chats"
  on messages for insert
  with check (exists (
    select 1 from chats
    where chats.id = messages.chat_id
    and chats.user_id = auth.uid()
  ));

  -- Create chats table
create table chats (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create messages table
create table messages (
  id uuid default gen_random_uuid() primary key,
  chat_id uuid references chats(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies
alter table chats enable row level security;
alter table messages enable row level security;

create policy "Users can view their own chats"
  on chats for select
  using (auth.uid() = user_id);

create policy "Users can insert their own chats"
  on chats for insert
  with check (auth.uid() = user_id);

create policy "Users can view messages in their chats"
  on messages for select
  using (exists (
    select 1 from chats
    where chats.id = messages.chat_id
    and chats.user_id = auth.uid()
  ));

create policy "Users can insert messages in their chats"
  on messages for insert
  with check (exists (
    select 1 from chats
    where chats.id = messages.chat_id
    and chats.user_id = auth.uid()
  ));