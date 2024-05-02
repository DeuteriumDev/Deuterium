'use client';
import { useState } from 'react';
import { CheckIcon, RotateCw, TriangleAlert } from 'lucide-react';
import _ from 'lodash';

import Button from '~/components/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '~/components/Dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
} from '~/components/Command';
import { Alert, AlertDescription, AlertTitle } from '~/components/Alert';
import useQuery from '~/libs/useQuery';
import addUsersToGroup from '~/actions/addUsersToGroup';
import queryUsers from '~/actions/queryUsers';
import { User } from '~/libs/types';
import cn from '~/libs/className';

interface GroupsUserAddDialogProps {
  id: string;
}

export default function GroupsUserAddDialog(props: GroupsUserAddDialogProps) {
  const { id } = props;
  const [where, setWhere] = useState('');
  const [selected, setSelected] = useState<User[]>([]);
  const query = useQuery<User>(
    () =>
      queryUsers(
        {
          page: 0,
          where: where
            ? `email like $2 and not ($1 = any(groups_ids))`
            : 'not ($1::uuid = any(groups_ids))',
        },
        [id, where && `%${where}%`],
      ),
    {
      initialize: true,
      dependencies: [where],
      debounce: 500,
    },
  );
  const mutate = useQuery(() =>
    addUsersToGroup({ users: selected, groupId: id }, [
      `/groups/${id}`,
      ..._.map(selected, (s) => `/users/${s.id}`),
    ]),
  );

  const _handleAddUsers = async () => {
    const data = await mutate.execute();
    if (!data.errorMessage) {
      setSelected([]);
      setWhere('');
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add user</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add user</DialogTitle>
          <DialogDescription>Add a user to this group</DialogDescription>
        </DialogHeader>
        {mutate.errorMessage && (
          <Alert variant="destructive">
            <TriangleAlert className="h-4 w-4" />
            <AlertTitle>Server Error</AlertTitle>
            <AlertDescription>{mutate.errorMessage}</AlertDescription>
          </Alert>
        )}
        <Command shouldFilter={false} className="min-h-40">
          <CommandInput
            onValueChange={(value) => {
              if (value) {
                setWhere(value);
              } else {
                setWhere('');
              }
            }}
            value={where}
            placeholder="Search users..."
            className="h-9"
          />
          {!query.loading && _.isEmpty(query.data?.rows) && (
            <CommandEmpty>No users found.</CommandEmpty>
          )}
          <CommandGroup>
            <CommandList>
              {_.map(
                _.compact(
                  _.concat(
                    selected,
                    !query.loading &&
                      (_.filter(
                        query.data?.rows,
                        (r) => !_.find(selected, { id: r.id }),
                      ) as unknown),
                  ),
                ) as User[],
                (u) => (
                  <CommandItem
                    value={u.id}
                    key={u.id}
                    onSelect={() => {
                      const index = _.findIndex(selected, { id: u.id });
                      setSelected(
                        index > -1
                          ? _.filter(selected, (_u, i) => i !== index)
                          : _.concat(selected, u),
                      );
                    }}
                  >
                    {u.email}
                    <CheckIcon
                      className={cn(
                        'ml-auto h-4 w-4',
                        _.find(selected, { id: u.id })
                          ? 'opacity-100'
                          : 'opacity-0',
                      )}
                    />
                  </CommandItem>
                ),
              )}
              {query.loading && <CommandLoading>Loading...</CommandLoading>}
            </CommandList>
          </CommandGroup>
        </Command>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              disabled={mutate.loading || _.isEmpty(selected)}
              onClick={_handleAddUsers}
            >
              {mutate.loading && (
                <RotateCw className="mr-2 h-4 w-4 animate-spin" />
              )}
              Add User(s)
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
